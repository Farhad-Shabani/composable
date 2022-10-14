import { Asset, BasePabloPool } from "shared";
import { PabloTransactions } from "@/defi/subsquid/pools/queries";
import {
  createPabloPoolAccountId,
  fromChainUnits,
} from "@/defi/utils";
import BigNumber from "bignumber.js";

export async function fetchPoolLiquidity(
  pools: BasePabloPool[]
): Promise<Record<string, { baseAmount: BigNumber; quoteAmount: BigNumber }>> {
  let liquidityRecord: Record<
    string,
    { baseAmount: BigNumber; quoteAmount: BigNumber }
  > = {};

  for (const pool of pools) {
    try {
      const api = pool.getApi();
      const pair = pool.getPair();
      const poolId = pool.getPoolId().toString();
      
      const base = pair.getBaseAsset();
      const quote = pair.getQuoteAsset();
      
      const poolAccountId = createPabloPoolAccountId(api, Number(poolId));
      const baseLiq = await new Asset(api, base, "", "", "").balanceOf(poolAccountId)
      const quoteLiq = await new Asset(api, quote, "", "", "").balanceOf(poolAccountId)

      liquidityRecord[poolId] = {
        baseAmount: baseLiq,
        quoteAmount: quoteLiq
      }
    } catch (err: any) {
      console.error(err);
    }
  }

  return liquidityRecord;
}

export function calculateProvidedLiquidity(
  transactions: PabloTransactions[]
): { baseAmountProvided: BigNumber; quoteAmountProvided: BigNumber } {
  let baseAmountProvided = new BigNumber(0);
  let quoteAmountProvided = new BigNumber(0);

  if (!transactions.length) {
    return {
      baseAmountProvided,
      quoteAmountProvided,
    };
  }

  transactions.forEach((tx) => {
    if (tx.event.eventType === "ADD_LIQUIDITY") {
      baseAmountProvided = baseAmountProvided.plus(
        fromChainUnits(tx.baseAssetAmount)
      );
      quoteAmountProvided = quoteAmountProvided.plus(
        fromChainUnits(tx.quoteAssetAmount)
      );
    } else if (tx.event.eventType === "REMOVE_LIQUIDITY") {
      baseAmountProvided = baseAmountProvided.minus(
        fromChainUnits(tx.baseAssetAmount)
      );
      quoteAmountProvided = quoteAmountProvided.minus(
        fromChainUnits(tx.quoteAssetAmount)
      );
    }
  });

  return {
    baseAmountProvided,
    quoteAmountProvided,
  };
}

export function fromRemoveLiquiditySimulationResult(result: { assets: { [assetId: number | string]: string } } ): Record<string, BigNumber> {
  let liquidityRecord: Record<string, BigNumber> = {};

  for (const key in result.assets) {
    liquidityRecord[key] = fromChainUnits(result.assets[key]);
  }

  return liquidityRecord;
}