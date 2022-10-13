import {
  LiquidityBootstrappingPool,
} from "@/defi/types";
import produce from "immer";
import { PoolsSlice } from "./pools.types";

export const setPoolsListVerified = (
  liquidityPoolsSlice: PoolsSlice["pools"],
  poolsList: Array<
    LiquidityBootstrappingPool
  >
) => {
  return produce(liquidityPoolsSlice, (draft) => {
    draft.liquidityBootstrappingPools.verified = [];

    poolsList.forEach((pool) => {
      if ((pool as LiquidityBootstrappingPool).sale) {
        draft.liquidityBootstrappingPools.verified.push(pool as LiquidityBootstrappingPool);
      }
    });
  });
};

export const putLiquidityBootstrappingPoolSpotPrice = (
  liquidityPoolsSlice: PoolsSlice["pools"],
  poolId: number,
  spotPrice: string
) => {
  return produce(liquidityPoolsSlice, (draft) => {
    let exists = draft.liquidityBootstrappingPools.spotPrices.find(
      (serie) => serie[0] === poolId
    );
    if (exists) {
      draft.liquidityBootstrappingPools.spotPrices =
        draft.liquidityBootstrappingPools.spotPrices.map((i) => {
          if (i[0] === poolId) {
            i[1] = spotPrice;
          }
          return i;
        });
    } else {
      draft.liquidityBootstrappingPools.spotPrices.push([poolId, spotPrice]);
    }
  });
};
