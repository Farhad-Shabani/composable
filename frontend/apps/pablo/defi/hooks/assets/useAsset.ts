import { Asset } from "shared";
import { DEFAULT_NETWORK_ID } from "@/defi/utils";
import { MockedAsset } from "@/store/assets/assets.types";
import { useMemo } from "react";
import useStore from "@/store/useStore";

export function useAsset(assetId: string): Asset | undefined {
    const { assetsV1 } = useStore();

    const asset = useMemo(() => {
        return assetsV1.find(_asset => _asset.getPicassoAssetId() as string === assetId)
    }, [assetsV1, assetId]);

    return asset;
}