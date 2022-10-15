import { useEffect, useState } from "react";
import { LiquidityProviderToken, Asset } from "shared";
import { DEFAULT_NETWORK_ID } from "@/defi/utils";
import BigNumber from "bignumber.js";
import useStore from "@/store/useStore";

export function useAssetBalance(
    address: string | undefined,
    asset: Asset | LiquidityProviderToken | undefined,
    network: string = DEFAULT_NETWORK_ID
): BigNumber {
    const { assetBalances } = useStore();
    const [assetBalance, setAssetBalance] = useState(new BigNumber(0))

    useEffect(() => {
        if (!asset || !address) return;

        // asset.balanceOf(address).then(setAssetBalance);
        const id = asset.getPicassoAssetId() as string;
        setAssetBalance(new BigNumber(assetBalances[network]?.[id]))
        return;

    }, [address, asset, assetBalances, network]);

    return assetBalance;
}