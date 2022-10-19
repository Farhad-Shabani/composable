import BigNumber from "bignumber.js";
import { Asset } from "./Asset";
import { ApiPromise } from "@polkadot/api";

export class ClaimableAsset extends Asset {
    protected __claimable: BigNumber;
  
    static fromAsset(asset: Asset, claimable: BigNumber): ClaimableAsset {
      return new ClaimableAsset(
        asset.getApi(),
        asset.getPicassoAssetId(true) as BigNumber,
        asset.getName(),
        asset.getSymbol(),
        asset.getIconUrl(),
        claimable
      )
    }
  
    constructor(
      api: ApiPromise,
      picassoAssetId: BigNumber,
      name: string,
      symbol: string,
      iconUrl: string,
      claimableAmount: BigNumber
    ) {
      super(api, picassoAssetId, name, symbol, iconUrl);
      this.__claimable = claimableAmount;
    }
  
    setClaimable(claimableAmount: BigNumber) {
      this.__claimable = claimableAmount;
    }
  
    getClaimable(): BigNumber {
      return this.__claimable;
    }
  }
  