import { useState } from "react";
import { Apollo, PabloConstantProductPool } from "shared";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import BigNumber from "bignumber.js";

export function useLpTokenPrice(
    liquidityPool: PabloConstantProductPool | undefined
): BigNumber {
    const [lpTokenPrice, setLpTokenPrice] = useState(new BigNumber(0));

    useAsyncEffect(async (): Promise<void> => {
        if (!liquidityPool) {
            setLpTokenPrice(new BigNumber(0))
            return;
        }
        
        try {
            const lpToken = liquidityPool.getLiquidityProviderToken();        
            const underlyingAssets = lpToken.getUnderlyingAssets();
            const apollo = new Apollo(liquidityPool.getApi());
            const prices = await apollo.getPrice(underlyingAssets);
            let totalValueLocked = new BigNumber(0);
            for (const underlyingAsset of underlyingAssets) {
                const balance = await underlyingAsset.balanceOf(liquidityPool.getAccountId());
                const underlyingAssetId = underlyingAsset.getPicassoAssetId() as string;
    
                totalValueLocked = totalValueLocked.plus(balance.times(prices[underlyingAssetId]));
            }
    
            const totalIssued = await lpToken.totalIssued();
            setLpTokenPrice(totalValueLocked.div(totalIssued));
        } catch (err) {
            console.log('[useLpTokenPrice] Error: ', err);
            setLpTokenPrice(new BigNumber(0));
        }

    }, [liquidityPool]);

    return lpTokenPrice;
}