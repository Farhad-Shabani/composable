import { Asset } from "shared";
import { useMemo } from "react";
import useStore from "@/store/useStore";

export function useAsset(assetId: string): Asset | undefined {
    const { assetsV1 } = useStore();

    const asset = useMemo(() => {
        return assetsV1.find(_asset => _asset.getPicassoAssetId() as string === assetId)
    }, [assetsV1, assetId]);

    return asset;
}