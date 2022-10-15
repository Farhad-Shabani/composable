import { Asset } from "shared";
import { useMemo } from "react";
import useStore from "@/store/useStore";

export function useAssets(assetIds: string[]): Asset[] {
    const { assets } = useStore();

    const _assets = useMemo(() => {
        return assets.filter(asset => assetIds.includes(asset.getPicassoAssetId() as string));
    }, [assets, assetIds]);

    return _assets;
}