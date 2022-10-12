import { MockedAsset } from "@/store/assets/assets.types";
import BigNumber from "bignumber.js";
import useStore from "@/store/useStore";
import { useMemo } from "react";

type AssetWithBalance = MockedAsset & { balance: BigNumber };

export function useAssetsWithBalance(networkId: string, filterBalance: boolean = false): AssetWithBalance[] {
    const {
        assetBalances,
        supportedAssets
    } = useStore();

    const assetsWithBalance = useMemo(() => {
        const withBalance = supportedAssets.map(asset => {
            let balance = new BigNumber(0);
            if(assetBalances[networkId]?.[asset.network[networkId]]) {
                balance = new BigNumber(assetBalances[networkId][asset.network[networkId]])
            }

            return {
                ...asset,
                balance
            }
        })

        let filteredBalance = filterBalance ? withBalance.filter(a => a.balance.gt(0)) : withBalance;
        return filteredBalance;
    }, [assetBalances, supportedAssets, networkId]);

    return assetsWithBalance;
}