import {
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { PairAsset } from "@/components/Atoms";
import { useAsset, useLpTokenPrice, useLpTokenUserBalance } from "@/defi/hooks";
import { PabloConstantProductPool } from "shared";
import BigNumber from "bignumber.js";

const LiquidityProviderPositionRow = ({
  pool,
}: {
  pool: PabloConstantProductPool
}) => {
  const pair = pool.getPair();
  const baseAsset = useAsset(pair.getBaseAsset().toString());
  const quoteAsset = useAsset(pair.getQuoteAsset().toString());
  const lpTokenUserBalance = useLpTokenUserBalance(pool);
  const lpTokenPrice = useLpTokenPrice(pool.getLiquidityProviderToken());
  const apr = new BigNumber(0);

  return (
    <TableRow key={`${pool.getLiquidityProviderToken().getSymbol()}`}>
      <TableCell align="left">
        {baseAsset && quoteAsset && (
          <PairAsset
            assets={[
              { icon: baseAsset.getIconUrl(), label: baseAsset.getSymbol() },
              { icon: quoteAsset.getIconUrl(), label: quoteAsset.getSymbol() },
            ]}
            separator="/"
          />
        )}
      </TableCell>
      <TableCell align="left">
        <Typography variant="body1">
          ${lpTokenPrice.toFormat(2)}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body1">{lpTokenUserBalance.toFormat(2)}</Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body1">
          ${lpTokenPrice.times(lpTokenUserBalance).toFormat(2)}
        </Typography>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body1">{apr.toFormat(2)}%</Typography>
      </TableCell>
    </TableRow>
  );
};

export default LiquidityProviderPositionRow;
