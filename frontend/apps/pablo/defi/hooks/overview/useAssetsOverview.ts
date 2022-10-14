import { DEFAULT_NETWORK_ID } from "@/defi/utils/constants";
import { useMemo } from "react";
import { useAssetsWithBalance } from "@/defi/hooks";
import useStore from "@/store/useStore";

export function useAssetsOverview(limit: number = 5) {
  const { apollo } = useStore();
  const assetsWithBalance = useAssetsWithBalance(DEFAULT_NETWORK_ID, true);

  const withBalance = useMemo(() => {
    return assetsWithBalance.slice(0, limit).map(asset => {
      const assetId = asset.getPicassoAssetId() as string;
      asset.setPrice(apollo[assetId]);
      return asset;
    })
  }, [assetsWithBalance, apollo, limit]);

  return withBalance;
}