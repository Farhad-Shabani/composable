import { BondOffer } from "shared";
import { ApiPromise } from "@polkadot/api";

export async function fetchBondOffer(parachainApi: ApiPromise, index: number): Promise<BondOffer | undefined> {
  let bondOffer: BondOffer | undefined = undefined;
  try {
    let offer = await parachainApi.query.bondedFinance.bondOffers(index);
    const [beneficiary, _offer] = offer.toJSON() as any;
    bondOffer = BondOffer.fromJSON(
      index,
      beneficiary,
      _offer
    );
  } catch (err) {
    console.error(err);
  } finally {
    return bondOffer;
  }
}

export async function fetchBondOffers(parachainApi: ApiPromise): Promise<BondOffer[]> {
  try {
    const bondOfferCount =
      await parachainApi.query.bondedFinance.bondOfferCount();
    const _bondOfferCount = Number(bondOfferCount.toString());

    let offerPromises = [];

    for (let i = 1; i <= _bondOfferCount; i++) {
      offerPromises.push(fetchBondOffer(parachainApi, i));
    }

    let bonds = await Promise.all(offerPromises);
    return bonds.filter(bond => !!bond) as BondOffer[];
  } catch (ex) {
    console.error(ex);
    return [];
  }
}
