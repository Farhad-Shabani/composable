import { useParachainApi } from "substrate-react";
import { useEffect, useState } from "react";
import { DEFAULT_NETWORK_ID, fetchOracleAssetPrice } from "../utils";
import BigNumber from "bignumber.js";
import { fromChainIdUnit } from "shared";

export function useOracleAssetPrice(
    assetId: BigNumber | string,
    priceDecimals: number = 12
): BigNumber {
    const { parachainApi } = useParachainApi(DEFAULT_NETWORK_ID);
    const [assetPrice, setAssetPrice] = useState(new BigNumber(0));

    useEffect(() => {
        if (!parachainApi) return;

        fetchOracleAssetPrice(
            parachainApi,
            assetId,
            priceDecimals
        ).then((oraclePrice) => {
            setAssetPrice(oraclePrice.price);
        }).catch((err) => {
            console.error()
        })

    }, [assetId, parachainApi, priceDecimals]);

    return assetPrice;
}