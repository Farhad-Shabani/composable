import useStore from "@/store/useStore";
import { useMemo } from "react";

export function useFilteredAssetListDropdownOptions(assetId: string) {
    const { assetsV1 } = useStore();

    const assetOptions = useMemo(() => {
        return assetsV1.filter(asset => asset.getPicassoAssetId() as string === assetId).map((asset) => ({
            value: asset.getPicassoAssetId() as string,
            label: asset.getName(),
            shortLabel: asset.getSymbol(),
            icon: asset.getIconUrl(),
          }));
    }, [assetsV1, assetId]);

    return assetOptions;
}