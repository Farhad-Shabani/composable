import {
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { BondOffer } from "shared";
import { useBondedAsset } from "@/defi/hooks/bonds/useBondedAsset";
import { useBondedOfferVestingState, useBondOfferROI } from "@/store/bond/bond.slice";
import { useAssetIdOraclePrice } from "@/defi/hooks";
import BondPrincipalAssetIcon from "../bonds/BondPrincipalAssetIcon";
import useBondVestingTime from "@/defi/hooks/bonds/useBondVestingTime";

export const OverviewBondedOfferRow = ({
  bondOffer,
  offerId
}: {
  offerId: string;
  bondOffer: BondOffer;
}) => {
  const bondedAsset_s = useBondedAsset(bondOffer);
  const discount = useBondOfferROI(offerId);
  const vestingTime = useBondVestingTime(bondOffer);
  const rewardAssetPriceUSD = useAssetIdOraclePrice(bondOffer.getRewardAssetId() as string);

  const {
    claimable
  } = useBondedOfferVestingState(offerId);

  return (
    <TableRow>
      <TableCell align="left">
        <BondPrincipalAssetIcon bondedAsset={bondedAsset_s} />
      </TableCell>
      <TableCell align="left">
        <Typography variant="body1">{discount.toFixed(2)}%</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body1">{claimable.toFixed(2)}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body1">${claimable.times(rewardAssetPriceUSD).toFixed()}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body1">{vestingTime}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body1">{0}</Typography>
      </TableCell>
    </TableRow>
  );
};
