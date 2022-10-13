import BigNumber from "bignumber.js";
import { useState, useEffect, useMemo } from "react";
import { useAllLpTokenRewardingPools } from "./useAllLpTokenRewardingPools";
import { DailyRewards } from "../poolStats/poolStats.types";
import { calculatePoolStats, fetchPoolStats } from "@/defi/utils/pablo";
import { useStakingRewardPool } from "../stakingRewards/stakingRewards.slice";
import { Asset, PabloConstantProductPool } from "shared";
import { useLiquidity } from "@/defi/hooks/useLiquidity";
import useStore from "../useStore";

export const useLiquidityPoolDetails = (poolId: number) => {
  const { poolStats, poolStatsValue, userLpBalances, putPoolStats, assetsV1 } = useStore();

  const allLpRewardingPools = useAllLpTokenRewardingPools();
  const [pool, setPool] =
    useState<PabloConstantProductPool | undefined>(undefined);

  const stakingRewardPool = useStakingRewardPool(pool ? pool.getLiquidityProviderToken().getPicassoAssetId() as string : "-");
  const tokensLocked = useLiquidity(pool);

  const [baseAsset, setBaseAsset] =
    useState<Asset | undefined>(undefined);
  const [quoteAsset, setQuoteAsset] =
    useState<Asset | undefined>(undefined);

  useEffect(() => {
    let matchingPool: PabloConstantProductPool | undefined =
      allLpRewardingPools.find((p) => {
        return (p.getPoolId(true) as BigNumber).eq(new BigNumber(poolId))
      });

    if (matchingPool) {
      const pair = matchingPool.getPair();
      let base = pair.getBaseAsset();
      let quote = pair.getQuoteAsset();
      const baseAsset = assetsV1.find(asset => (base.eq(asset.getPicassoAssetId(true))))
      const quoteAsset = assetsV1.find(asset => (quote.eq(asset.getPicassoAssetId(true))))
      setPool(matchingPool);
      setBaseAsset(baseAsset);
      setQuoteAsset(quoteAsset);
    } else {
      setPool(undefined);
      setBaseAsset(undefined);
      setQuoteAsset(undefined);
    }
  }, [poolId, allLpRewardingPools, assetsV1]);

  useEffect(() => {
    if (pool) {
      fetchPoolStats(pool).then((poolStates) => {
        const poolStats = calculatePoolStats(poolStates);
        if (poolStats) {
          putPoolStats((pool.getPoolId(true) as BigNumber).toNumber(), poolStats)
        }
      })
    }
  }, [pool, putPoolStats]);

  const _poolStats = useMemo(() => {
    let _poolValue = {
      _24HrFeeValue: "0",
      _24HrVolumeValue: "0",
      totalVolumeValue: "0",
    };

    let _poolStats = {
      _24HrTransactionCount: 0,
      dailyRewards: [] as DailyRewards[],
      apr: "0",
    };

    if (poolStatsValue[poolId]) {
      _poolValue = poolStatsValue[poolId];
    }

    if (poolStats[poolId]) {
      _poolStats = poolStats[poolId];
    }

    return {
      ..._poolValue,
      ..._poolStats,
    };
  }, [poolStats, poolStatsValue, poolId]);

  const lpBalance = useMemo(() => {
    if (pool) {
      const poolId = (pool.getPoolId(true) as BigNumber).toNumber();
      if (userLpBalances[poolId]) {
        return new BigNumber(userLpBalances[poolId]);
      }
    }
    return new BigNumber(0);
  }, [pool, userLpBalances]);

  return {
    stakingRewardPool,
    baseAsset,
    quoteAsset,
    pool,
    lpBalance,
    tokensLocked,
    poolStats: _poolStats,
  };
};
