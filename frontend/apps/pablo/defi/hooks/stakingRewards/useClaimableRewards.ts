import BigNumber from "bignumber.js";
import { useMemo } from "react";
import { useAssets } from "../assets";
import { useStakingPositions } from "./useStakingPositions";
import { Stake, StakingRewardPool } from "@/defi/types";
import { Asset, fromChainIdUnit } from "shared";
import { ApiPromise } from "@polkadot/api";

class ClaimableAsset extends Asset {
  protected __claimable: BigNumber;

  static fromAsset(asset: Asset, claimable: BigNumber): ClaimableAsset {
    return new ClaimableAsset(
      asset.getApi(),
      asset.getPicassoAssetId(true) as BigNumber,
      asset.getName(),
      asset.getSymbol(),
      asset.getIconUrl(),
      claimable
    )
  }

  constructor(
    api: ApiPromise,
    picassoAssetId: BigNumber,
    name: string,
    symbol: string,
    iconUrl: string,
    claimableAmount: BigNumber
  ) {
    super(api, picassoAssetId, name, symbol, iconUrl);
    this.__claimable = claimableAmount;
  }

  setClaimable(claimableAmount: BigNumber) {
    this.__claimable = claimableAmount;
  }

  getClaimable(): BigNumber {
    return this.__claimable;
  }
}

type ClaimableRewardsProps = {
  stakedAssetId?: string;
};

function claimOfStake(
  stake: Stake,
  stakingRewardPool: StakingRewardPool,
  rewardAssetId: string
): BigNumber {
  if (stakingRewardPool.totalShares.eq(0)) {
    return new BigNumber(0);
  } else {
    let inflation =
      fromChainIdUnit(stake.reductions[rewardAssetId]) || new BigNumber(0);

    const totalRewards = fromChainIdUnit(
      stakingRewardPool.rewards[rewardAssetId].totalRewards
    );
    const share = stake.share;
    const totalShares = stakingRewardPool.totalShares;
    const myShare = totalRewards.times(share).div(totalShares);

    return myShare.minus(inflation);
  }
}

function calculateClaim(
  stake: Stake,
  stakingRewardPool: StakingRewardPool,
  accountForPenalty: boolean = false
): [string, BigNumber, string][] {
  return Object.keys(stakingRewardPool.rewards).map((assetId) => {
    let claimable = claimOfStake(stake, stakingRewardPool, assetId);

    if (claimable.lte(0)) {
      claimable = new BigNumber(0);
    }

    let is_penalized =
      stake.lock.startedAt.plus(stake.lock.duration).toNumber() > Date.now();

    if (!stakingRewardPool.rewards[assetId].totalRewards.eq(0)) {
      if (is_penalized && accountForPenalty) {
        claimable = claimable.minus(
          claimable.times(stakingRewardPool.lock.unlockPenalty)
        );
      }
    }

    claimable = BigNumber.min(
      claimable,
      fromChainIdUnit(
        stakingRewardPool.rewards[assetId].totalRewards.minus(
          stakingRewardPool.rewards[assetId].claimedRewards
        )
      )
    );

    return [assetId, claimable, stake.fnftInstanceId];
  });
}

export function useClaimableRewards({
  stakedAssetId,
}: ClaimableRewardsProps): {
  claimableAssets: Array<ClaimableAsset>;
  financialNftInstanceId: string;
} {
  const { stakingRewardPool, stakes } = useStakingPositions({
    stakedAssetId,
  });

  const rewardAssets = useAssets(
    stakingRewardPool ? Object.keys(stakingRewardPool.rewards) : []
  );

  const claimableAmounts = useMemo(() => {
    if (!stakingRewardPool || stakes.length === 0) return [];

    return calculateClaim(stakes[0], stakingRewardPool, false);
  }, [stakes, stakingRewardPool]);

  return useMemo(() => {
    let financialNftInstanceId = "-";
    const claimableAssets = rewardAssets.map((asset) => {
      const assetId = asset.getPicassoAssetId() as string;
      let claimableAmount = new BigNumber(0);
      const claimableAsset = ClaimableAsset.fromAsset(asset, claimableAmount);
      if (claimableAmounts.length > 0) {
        const claimableFromStake = claimableAmounts.find(
          ([_assetId, _val]) => _assetId === assetId
        );

        if (claimableFromStake) {
          financialNftInstanceId = claimableFromStake[2];
          claimableAsset.setClaimable(claimableFromStake[1]);
        }
      }

      return claimableAsset;
    });

    return { claimableAssets, financialNftInstanceId };
  }, [rewardAssets, claimableAmounts]);
}
