import { fromChainUnits } from "@/defi/utils";
import { ApiPromise } from "@polkadot/api";

export const fetchBalanceByAssetId = async (
  api: ApiPromise,
  accountId: string,
  assetId: string
): Promise<string> => {
  try {
    // @ts-ignore
    const balance = await api.rpc.assets.balanceOf(
      api.createType("CustomRpcCurrencyId", assetId),
      api.createType("AccountId32", accountId)
    );
    return fromChainUnits(balance.toString()).toString();
  } catch (err: any) {
    return "0";
  }
};