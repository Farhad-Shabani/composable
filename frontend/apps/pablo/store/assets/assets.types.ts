import BigNumber from "bignumber.js";
import { Asset } from "shared";

export interface MockedAsset {
    name: string;
    decimals: number;
    symbol: string;
    icon: string;
    network: Record<string, string>
}

export interface AssetsSlice {
    assetsV1: Asset[],
    setAssetsV1: (assets: Asset[]) => void;
    supportedAssets: MockedAsset[];
    assetBalances: Record<string, Record<string, string>>,
    apollo: {
        [id: string]: BigNumber;
    }
    setPrices: (
        priceMap: Record<string, BigNumber>
    ) => void;
    putAssetBalance: (
        networkId: string,
        assetId: string,
        balance: string
    ) => void;
}