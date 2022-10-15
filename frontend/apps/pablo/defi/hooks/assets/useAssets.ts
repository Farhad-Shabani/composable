import { Asset } from "shared";
import { useMemo } from "react";
import useStore from "@/store/useStore";

export function useAssets(assetIds: string[]): Asset[] {
    const { assetsV1 } = useStore();

    const _assets = useMemo(() => {
        return assetsV1.filter(asset => assetIds.includes(asset.getPicassoAssetId() as string));
    }, [assetsV1, assetIds]);

    return _assets;
}