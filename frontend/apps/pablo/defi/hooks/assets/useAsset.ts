import { Asset } from "shared";
import { useMemo } from "react";
import useStore from "@/store/useStore";

export function useAsset(assetId: string): Asset | undefined {
    const { assets } = useStore();

    const asset = useMemo(() => {
        return assets.find(_asset => _asset.getPicassoAssetId() as string === assetId)
    }, [assets, assetId]);

    return asset;
}