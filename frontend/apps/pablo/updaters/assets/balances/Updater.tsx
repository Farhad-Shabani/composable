import { useCallback, useEffect } from "react";
import {
  useExtrinsics,
  useParachainApi,
  useSelectedAccount,
} from "substrate-react";
import { DEFAULT_NETWORK_ID } from "@/defi/utils";
import { SUPPORTED_ASSETS } from "@/store/assets/assets.slice";
import { Asset } from "shared";
import useStore from "@/store/useStore";
import BigNumber from "bignumber.js";

function shouldUpdateBalances(tx: any, account: string): boolean {
  if (
    [
      "dexRouter",
      "bondedFinance",
      "pablo",
      "stakingRewards"
    ].includes(tx.section) && tx.sender === account &&
    tx.status === "isFinalized"
  ) {
    return true;
  }
  return false;
}

const processedTransactions: string[] = [];
const Updater = () => {
  const { putAssetBalance, setAssetsV1, assets } = useStore();
  const { parachainApi } = useParachainApi(DEFAULT_NETWORK_ID);
  const selectedAccount = useSelectedAccount(DEFAULT_NETWORK_ID);
  const extrinsicCalls = useExtrinsics();

  useEffect(() => {
    if (!parachainApi) return;
    setAssetsV1(SUPPORTED_ASSETS.map((v) => (new Asset(
      parachainApi,
      new BigNumber(v.network["picasso"]),
      v.name,
      v.symbol,
      v.icon
    ))))
  }, [parachainApi, setAssetsV1])

  const updateAllBalances = useCallback(async () => {
    if (assets.length > 0 && selectedAccount) {
      for (const asset of assets) {
        const assetBalance = await asset.balanceOf(selectedAccount.address);
        putAssetBalance(DEFAULT_NETWORK_ID, asset.getPicassoAssetId() as string, assetBalance.toString())
      }
    }
  }, [selectedAccount, assets, putAssetBalance])

  useEffect(() => {
    if (updateAllBalances && typeof updateAllBalances === "function") {
      updateAllBalances();
    }
  }, [updateAllBalances]);

  useEffect(() => {
    if (
      parachainApi &&
      selectedAccount &&
      Object.values(extrinsicCalls).length > 0
    ) {
      const txs = Object.values(extrinsicCalls);

      let shouldUpdate: string | null = null;
      txs.forEach((tx) => {
        if (
          shouldUpdateBalances(tx, selectedAccount.address) &&
          !processedTransactions.includes(tx.hash)
        ) {
          shouldUpdate = tx.hash;
        }
      });

      if (shouldUpdate !== null) {
        updateAllBalances().then((updatedBalancesAssetList) => {
          processedTransactions.push(shouldUpdate as string);
        });
      }
    }
  }, [extrinsicCalls, parachainApi, selectedAccount, updateAllBalances]);

  return null;
};

export default Updater;