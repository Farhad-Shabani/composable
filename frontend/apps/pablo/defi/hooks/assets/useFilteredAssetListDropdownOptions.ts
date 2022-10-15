import { AssetDropdownOptions } from "@/defi/types";
import useStore from "@/store/useStore";
import { useMemo } from "react";

export function useFilteredAssetListDropdownOptions(assetId: string): AssetDropdownOptions {
    const { assets } = useStore();

    const assetOptions = useMemo(() => {
        return assets.filter(asset => asset.getPicassoAssetId() as string === assetId).map((asset) => ({
            value: asset.getPicassoAssetId() as string,
            label: asset.getName(),
            shortLabel: asset.getSymbol(),
            icon: asset.getIconUrl(),
          }));
    }, [assets, assetId]);

    return assetOptions;
}