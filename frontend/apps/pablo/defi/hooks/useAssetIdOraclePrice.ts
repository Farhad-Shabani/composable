import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import useStore from "@/store/useStore";

export function useAssetIdOraclePrice(
    assetId: BigNumber | string | undefined
): BigNumber {
    const { apollo } = useStore();
    const [assetPrice, setAssetPrice] = useState(new BigNumber(0));

    useEffect(() => {
        if (!assetId) return;
        const _assetId = typeof assetId === "string" ? assetId : assetId.toString();
        if (!apollo[_assetId]) return;
        setAssetPrice(apollo[_assetId]);
    }, [assetId, apollo]);

    return assetPrice;
}