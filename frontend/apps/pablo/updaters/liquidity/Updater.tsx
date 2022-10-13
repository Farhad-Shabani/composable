import useStore from "@/store/useStore";
import BigNumber from "bignumber.js";
import { useEffect } from "react";
import { useSelectedAccount } from "substrate-react";
import { DEFAULT_NETWORK_ID } from "@/defi/utils/constants";
import { fetchPoolLiquidity } from "@/defi/utils";
import { usePoolsSlice } from "@/store/pools/pools.v1.slice";

const Updater = () => {
  const selectedAccount = useSelectedAccount(DEFAULT_NETWORK_ID);
  const { constantProductPools } = usePoolsSlice();
  const { putLiquidityInPoolRecord, setUserLpBalance } =
    useStore();
  /**
   * For each pool, fetch its
   * base and quote token amount
   * and update it in zustand store
   * (first call)
   */
  useEffect(() => {
    if (constantProductPools.length > 0) {
      fetchPoolLiquidity(constantProductPools).then(putLiquidityInPoolRecord)
    }
  }, [constantProductPools, putLiquidityInPoolRecord]);
  /**
   * Fetch and update LP Balances within
   * zustand store
   */
  useEffect(() => {
    if (constantProductPools.length > 0 && selectedAccount) {
      for (const pool of constantProductPools) {
        const lpToken = pool.getLiquidityProviderToken();
        const poolId: BigNumber = pool.getPoolId(true) as BigNumber;
        lpToken.balanceOf(selectedAccount.address).then(balance => {
          setUserLpBalance(poolId.toNumber(), balance.toString());
        })
      }
    }
  }, [constantProductPools, selectedAccount, setUserLpBalance]);

  return null;
};

export default Updater;
