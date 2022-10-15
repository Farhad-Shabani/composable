import create from "zustand";
import createAssetsSlice from "./assets/assets.slice";
import createSwapsSlice from "./swaps/swaps.slice";

import createLiquiditySlice from "./liquidity/liquidity.slice";
import createRemoveLiquiditySlice from "./removeLiquidity/removeLiquidity.slice";
import createPoolSlice from "./createPool/createPool.slice";
import createPoolStatsSlice from "./poolStats/poolStats.slice";
import { AssetsSlice } from "@/store/assets/assets.types";

import { SwapsSlice } from "@/store/swaps/swaps.types";

import { LiquiditySlice } from "@/store/liquidity/liquidity.types";
import { RemoveLiquiditySlice } from "@/store/removeLiquidity/removeLiquidity.types";
import { PoolStatsSlice } from "@/store/poolStats/poolStats.types";
import { CreatePoolSlice } from "@/store/createPool/createPool.types";

type SliceCombined = AssetsSlice &
  SwapsSlice &
  CreatePoolSlice &
  LiquiditySlice &
  RemoveLiquiditySlice &
  PoolStatsSlice

const useStore = create<SliceCombined>(
  // persist(
  (set, _get) => ({
    ...createAssetsSlice(set),
    ...createSwapsSlice(set),
    ...createLiquiditySlice(set),
    ...createRemoveLiquiditySlice(set),
    ...createPoolSlice(set),
    ...createPoolStatsSlice(set)
  })
  // {
  //   name: "pablo",
  //   partialize: (state) => ({ assets: state.assets, auctions: state.auctions }),
  // }
  // )
);

export default useStore;
