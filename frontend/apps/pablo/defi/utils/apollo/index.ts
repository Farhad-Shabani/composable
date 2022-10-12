import { fromChainIdUnit } from "shared";
import { ApiPromise } from "@polkadot/api";
import BigNumber from "bignumber.js";

export async function fetchOracleAssetPrice(
  api: ApiPromise,
  assetId: string | BigNumber,
  priceDecimals:  number = 12
): Promise<{ price: BigNumber, block: BigNumber }> {
  try {
    const oraclePrice = await api.query.oracle.prices(
      typeof assetId === "string" ? assetId : assetId.toString()
    );
    
    const price = fromChainIdUnit(BigInt(oraclePrice.price.toString()), priceDecimals);
    const block = fromChainIdUnit(BigInt(oraclePrice.block.toString()), priceDecimals);

    return { price, block }
  } catch (error) {
    return Promise.reject(error);
  }
}


export async function fetchApolloPriceByAssetId (
  api: ApiPromise,
  assetId: string
): Promise<string> {
  try {
    let data = await api.query.oracle.prices(assetId);
    const decoded: any = data.toJSON();
    return decoded.price;
  } catch (err: any) {
    return "0";
  }
};

export async function fetchApolloPriceByAssetIds (
  api: ApiPromise,
  assetIds: string[]
): Promise<Record<string, BigNumber>> {
  let usdPricesRecord: Record<string, BigNumber> = {};

  for (const assetId of assetIds) {
    let price = new BigNumber(0);
    try {
      const p = await fetchApolloPriceByAssetId(api, assetId);
      price = new BigNumber(p);
    } catch (err) {
      console.error(`Error fetching price assetId: ${assetId}, Error: ${err}`)
    } finally {
      usdPricesRecord[assetId] = price;
    }
  }

  return usdPricesRecord;
}