import BigNumber from "bignumber.js";
import { ApiPromise } from "@polkadot/api";
import { Asset } from "./Asset";

export class LiquidityProviderToken extends Asset {
    protected __underlyingAssets: Asset[];

    constructor(
        api: ApiPromise,
        underlyingAssets: Asset[],
        tokenAssetId: BigNumber
    ) {
        super(
            api,
            tokenAssetId,
            `LP ${underlyingAssets.map(x => x.getSymbol()).join("/")}`,
            `${underlyingAssets.map(x => x.getSymbol()).join("/")}`,
            "-"
        );
        this.__underlyingAssets = underlyingAssets;
    }

    getUnderlyingAssets(): Asset[] {
        return this.__underlyingAssets;
    }
}

export class OwnedLiquidityProviderToken extends LiquidityProviderToken {
    protected __balance: BigNumber;

    constructor(
        api: ApiPromise,
        underlyingAssets: Asset[],
        tokenAssetId: BigNumber,
        balance: BigNumber
    ) {
        super(
            api,
            underlyingAssets,
            tokenAssetId,
        );
        this.__balance = balance;
    }

    public setBalance(balance: BigNumber) {
        this.__balance = balance;
    }

    public getBalance(): BigNumber {
        return this.__balance;
    }
}