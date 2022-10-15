import { Asset, BondOffer } from "shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateBondROI,
  DEFAULT_NETWORK_ID
} from "@/defi/utils";
import { useParachainApi } from "substrate-react";
import useStore from "@/store/useStore";
import BigNumber from "bignumber.js";
import {
  updateExistingBondOffer,
  useBondedOfferVestingScheduleIds,
  useBondedOfferVestingSchedules,
  useBondOffersSlice,
} from "@/store/bond/bond.slice";
import { useBondedAsset } from "./useBondedAsset";

export default function useBondOffer(offerId: string) {
  const { parachainApi } = useParachainApi(DEFAULT_NETWORK_ID);

  const { assets, apollo } = useStore();
  const { bondOffers } = useBondOffersSlice();
  const vestingScheduleIds = useBondedOfferVestingScheduleIds(offerId);
  const vestingSchedules = useBondedOfferVestingSchedules(offerId);

  const [selectedBondOffer, setSelectedBondOffer] = useState<
    BondOffer | undefined
  >(undefined);

  useEffect(() => {
    let offer = bondOffers.find((o) => o.getBondOfferId() === offerId);
    if (offer) {
      setSelectedBondOffer(offer);
    }
  }, [bondOffers, offerId]);

  const bondedAsset_s = useBondedAsset(selectedBondOffer);

  const rewardAsset = useMemo<Asset | undefined>(() => {
    if (assets.length > 0 && selectedBondOffer) {
      return assets.find(asset => (asset.getPicassoAssetId(true) as BigNumber).eq(
        selectedBondOffer.getRewardAssetId(true) as BigNumber
      ))
    }
  }, [assets, selectedBondOffer]);

  const rewardAssetPerBond = useMemo(() => {
    if (selectedBondOffer) {
      return (selectedBondOffer.getRewardAssetAmount(true) as BigNumber).div(
        selectedBondOffer.getNumberOfBonds(true) as BigNumber
      )
    }
    return new BigNumber(0);
  }, [selectedBondOffer]);

  const principalAssetPerBond = useMemo(() => {
    if (selectedBondOffer) {
      return selectedBondOffer.getBondPrice(true) as BigNumber;
    }
    return new BigNumber(0);
  }, [selectedBondOffer]);

  const updateBondInfo = useCallback(async () => {
    if (parachainApi && selectedBondOffer) {
      try {
        const bondOffer = await parachainApi.query.bondedFinance.bondOffers(
          selectedBondOffer.getBondOfferId() as string
        );

        const [beneficiary, _offer] = bondOffer.toJSON() as any;
        updateExistingBondOffer(BondOffer.fromJSON(
          (selectedBondOffer.getBondOfferId(true) as BigNumber).toNumber(),
          beneficiary,
          _offer
        ));
      } catch (err) {
        console.error(err);
      }
    }
  }, [selectedBondOffer, parachainApi]);

  const roi = useMemo(() => {
    if (principalAssetPerBond.gt(0) && rewardAssetPerBond.gt(0) && selectedBondOffer) {
      const bondedAsset = selectedBondOffer?.getbondedAssetId() as string;
      const rewardAsset = selectedBondOffer?.getRewardAssetId() as string;
      if (
        apollo[bondedAsset] &&
        apollo[rewardAsset]
      ) {
        return calculateBondROI(
          new BigNumber(apollo[bondedAsset]),
          new BigNumber(apollo[rewardAsset]),
          principalAssetPerBond,
          rewardAssetPerBond
        );
      }
    }
    return new BigNumber(0);
  }, [principalAssetPerBond, rewardAssetPerBond, apollo, selectedBondOffer]);

  return {
    selectedBondOffer,
    rewardAsset,
    updateBondInfo,
    principalAssetPerBond,
    rewardAssetPerBond,
    roi,
    vestingSchedules,
    vestingScheduleIds,
    bondedAsset_s
  };
}

export type SelectedBondOffer = ReturnType<typeof useBondOffer>;
