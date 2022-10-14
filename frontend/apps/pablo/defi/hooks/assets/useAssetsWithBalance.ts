import { useMemo } from "react";
import { OwnedAsset } from "shared";
import BigNumber from "bignumber.js";
import useStore from "@/store/useStore";

export function useAssetsWithBalance(networkId: string, filterBalance: boolean = false): OwnedAsset[] {
    const {
        assetBalances,
        assetsV1
    } = useStore();

    const assetsWithBalance = useMemo(() => {
        const withBalance = assetsV1.map(asset => {
            let balance = new BigNumber(0);
            const assetId = asset.getPicassoAssetId() as string;

            if (assetBalances[networkId]?.[assetId]) {
                balance = new BigNumber(assetBalances[networkId]?.[assetId])
            }

            return OwnedAsset.fromAsset(asset, balance);
        })

        let filteredBalance = filterBalance ? withBalance.filter(a => a.getBalance().gt(0)) : withBalance;
        return filteredBalance;
    }, [assetsV1, filterBalance, assetBalances, networkId]);

    return assetsWithBalance;
}