import { useState } from "react";
import { Asset, PabloLiquidityBootstrappingPool } from "shared";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { usePoolsSlice } from "@/store/pools/pools.v1.slice";
import BigNumber from "bignumber.js";
import useStore from "@/store/useStore";

type PermissionedAuctionPool = {
  pool: PabloLiquidityBootstrappingPool;
  pair: {
    base: Asset | undefined;
    quote: Asset | undefined;
  }
  spotPrice: BigNumber
}

export const usePermissionedAuctionPools = (): {
  tableLimit: number;
  setTableLimit: (limit: number) => void;
  permissionedPools: Array<PermissionedAuctionPool>;
} => {
  const { liquidityBootstrappingPools } = usePoolsSlice();
  const { assets } = useStore();
  const [tableLimit, setTableLimit] = useState(5);
  const [permissionedPools, setPermissionedPools] = useState<Array<PermissionedAuctionPool>>([]);

  useAsyncEffect(async (): Promise<void> => {
    let pools: PermissionedAuctionPool[] = [];

    for (const pool of liquidityBootstrappingPools) {
      const spotPrice = await pool.getSpotPrice();
      const base = assets.find(asset => (asset.getPicassoAssetId(true) as BigNumber).eq(pool.getPair().getBaseAsset()))
      const quote = assets.find(asset => (asset.getPicassoAssetId(true) as BigNumber).eq(pool.getPair().getQuoteAsset()))

      pools.push({
        pool,
        pair: { base, quote },
        spotPrice
      })
    }

    setPermissionedPools(pools)
  }, [assets, liquidityBootstrappingPools]);

  return {
    permissionedPools,
    tableLimit,
    setTableLimit
  };
};
