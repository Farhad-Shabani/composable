import { PabloConstantProductPool } from "shared";
import create from "zustand";

export const usePoolsSlice = create<{ constantProductPools: PabloConstantProductPool[] }>(() => ({
  constantProductPools: []
}));

export const setPermissionedConstantProductPools = (pools: PabloConstantProductPool[]) => usePoolsSlice.setState((state) => ({
  constantProductPools: pools
}));
