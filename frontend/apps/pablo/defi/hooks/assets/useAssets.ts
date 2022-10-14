import { DEFAULT_NETWORK_ID } from "@/defi/utils";
import { MockedAsset } from "@/store/assets/assets.types";
import { useMemo } from "react";
import useStore from "@/store/useStore";

export function useAssets(assetIds: string[]): MockedAsset[] {
    const { supportedAssets } = useStore();

    const selectedAsset = useMemo(() => {
        return supportedAssets.filter(asset => assetIds.includes(asset.network[DEFAULT_NETWORK_ID]));
    }, [supportedAssets, assetIds]);

    return selectedAsset;
}