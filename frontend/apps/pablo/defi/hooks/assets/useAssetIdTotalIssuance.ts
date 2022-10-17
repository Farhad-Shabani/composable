import { useEffect, useState } from "react";
import { useParachainApi } from "substrate-react";
import { DEFAULT_NETWORK_ID } from "@/defi/utils";
import BigNumber from "bignumber.js";
import { Asset } from "shared";

export function useAssetIdTotalIssuance(
    assetId: BigNumber | string | undefined,
    name: string = "",
    symbol: string = "",
    iconUrl: string = ""
): BigNumber {
    const { parachainApi } = useParachainApi(DEFAULT_NETWORK_ID);
    const [totalIssuance, setTotalIssuance] = useState(new BigNumber(0));

    useEffect(() => {
        if (!parachainApi || !assetId) return;

        const xToken = new Asset(
            parachainApi,
            typeof assetId === "string" ? new BigNumber(assetId) : assetId,
            name,
            symbol,
            iconUrl
        );

        xToken.totalIssued().then(setTotalIssuance);
    }, [parachainApi]);

    return totalIssuance;
}