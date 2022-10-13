import { LiquidityBootstrappingPool } from "@/defi/types";

export interface LiquidityBootstrappingPoolStats {
    startBalances: {
        quote: string;
        base: string;
    };
    currentBalances: {
        quote: string;
        base: string;
    };
    totalSold: string;
    totalRaised: string;
    totalVolume: string;
    liquidity: string;
}


export type LiquidityPoolType =
  | "StableSwap"
  | "ConstantProduct"
  | "LiquidityBootstrapping";


export interface PoolsSlice {
    pools: {
        liquidityBootstrappingPools: {
            verified: LiquidityBootstrappingPool[];
            unVerified: LiquidityBootstrappingPool[];
            spotPrices: [number, string][]
        },
        setPoolsList: (
            pools: AnyPoolArray
        ) => void;
        setLiquidityBootstrappingPoolSpotPrice: (
            poolId: number,
            spotPrice: string
        ) => void;
    }
}

export type AnyPoolArray = Array<LiquidityBootstrappingPool>
