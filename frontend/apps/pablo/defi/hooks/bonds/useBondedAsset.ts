import { PabloConstantProductPool, Asset, BondOffer, LiquidityProviderToken } from "shared";
import BigNumber from "bignumber.js";
import useStore from "@/store/useStore";
import { usePoolsSlice } from "@/store/pools/pools.v1.slice";

export function useBondedAsset(
    bondOffer?: BondOffer
): LiquidityProviderToken | Asset | undefined {
    const { assetsV1 } = useStore();
    const lpRewardingPools = usePoolsSlice().constantProductPools;
    
    if (!bondOffer) return undefined;

    const isLpBasedBond: PabloConstantProductPool | undefined =
        lpRewardingPools.find(
            (pool: PabloConstantProductPool) =>
                (pool.getLiquidityProviderToken().getPicassoAssetId(true) as BigNumber)
                    .eq(bondOffer.getBondOfferId(true) as BigNumber)
        );

    if (isLpBasedBond) {
        return isLpBasedBond.getLiquidityProviderToken();
    } else {
        return assetsV1.find(asset => {
            (asset.getPicassoAssetId(true) as BigNumber).eq(bondOffer.getbondedAssetId(true) as BigNumber)
        })
    }
}
