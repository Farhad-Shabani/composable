import { AssetMetadata, getAssetByOnChainId } from "@/defi/polkadot/Assets";
import { AssetId } from "@/defi/polkadot/types";
import useStore from "@/store/useStore";
import { DEFAULT_NETWORK_ID } from "@/defi/utils/constants";
import BigNumber from "bignumber.js";
import _ from "lodash";
import { useMemo } from "react";
import { DailyRewards } from "../poolStats/poolStats.types";
import { useAllLpTokenRewardingPools } from "./useAllLpTokenRewardingPools";
import { ConstantProductPool, StableSwapPool } from "../pools/pools.types";

export interface LiquidityPoolRow {
  poolId: number;
  baseAsset: AssetMetadata;
  quoteAsset: AssetMetadata;
  totalVolume: BigNumber;
  apr: BigNumber;
  totalValueLocked: BigNumber;
  dailyRewards: DailyRewards[];
  lpTokenAssetId: string;
}

export const useLiquidityPoolsList = (): LiquidityPoolRow[] => {
  const { poolStats, poolStatsValue, poolLiquidity } = useStore();
  const allLpRewardingPools = useAllLpTokenRewardingPools();

  const liquidityPoolsList = useMemo(() => {
    return allLpRewardingPools.map((pool: ConstantProductPool | StableSwapPool) => {
      const { pair, poolId } = pool;
      
      if (pair && poolId) {
        const baseAsset = getAssetByOnChainId(DEFAULT_NETWORK_ID, pair.base);
        const quoteAsset = getAssetByOnChainId(DEFAULT_NETWORK_ID, pair.quote);
        const lpTokenAssetId = pool.lpToken;
  
        let totalVolume = new BigNumber(0);
        if (poolStatsValue[pool.poolId]) {
          totalVolume = totalVolume.plus(poolStatsValue[pool.poolId].totalVolumeValue);
        }
  
        let totalValueLocked = new BigNumber(0);
        if (poolLiquidity[pool.poolId]) {
          const { baseValue, quoteValue } = poolLiquidity[pool.poolId].value;
          totalValueLocked = new BigNumber(baseValue).plus(quoteValue)
        }
        
        let dailyRewards: DailyRewards[] = [], apr = new BigNumber(0);
        if (poolStats[pool.poolId]) {
          dailyRewards = poolStats[pool.poolId].dailyRewards;
          apr = new BigNumber(poolStats[pool.poolId].apr)
        }
  
        return {
          poolId,
          baseAsset,
          quoteAsset,
          totalVolume,
          lpTokenAssetId,
          totalValueLocked,
          dailyRewards,
          apr
        };
      }
      return null;
    }).filter(i => !!i)

  }, [allLpRewardingPools, poolLiquidity, poolStatsValue, poolStats]);

  return liquidityPoolsList as LiquidityPoolRow[];
};