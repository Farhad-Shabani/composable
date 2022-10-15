import {
  Box,
  BoxProps,
  Typography,
  TypographyProps,
  useTheme,
} from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { getHumanizedDateDiff, PabloLiquidityBootstrappingPool } from "shared";
import { LiquidityBootstrappingPool } from "@/defi/types";
import { AVERAGE_BLOCK_TIME, DEFAULT_NETWORK_ID } from "@/defi/utils";
import { useCallback, useMemo } from "react";
import useBlockNumber from "@/defi/hooks/useBlockNumber";
import { useBlockInterval } from "@/defi/hooks";

export type AuctionStatusIndicatorProps = {
  auction: PabloLiquidityBootstrappingPool,
  labelWithDuration?: boolean,
  label?: string,
  LabelProps?: TypographyProps,
} & BoxProps;

export const AuctionStatusIndicator: React.FC<AuctionStatusIndicatorProps> = ({
  auction,
  labelWithDuration = false,
  label,
  LabelProps,
  ...rest
}) => {
  const blockNumber = useBlockNumber(DEFAULT_NETWORK_ID);
  const blockInterval = useBlockInterval();
  const theme = useTheme();
  const willBeActive: boolean = blockNumber.lt(auction.getSaleConfig().start);
  const isActive: boolean = blockNumber.gte(auction.getSaleConfig().start)
    && blockNumber.lte(auction.getSaleConfig().end);
  const isEnded: boolean = blockNumber.gt(auction.getSaleConfig().end);

  const getLabel = useCallback(() => {
    if (willBeActive) {
      if (!labelWithDuration) {
        return "Starting Soon";
      } else {
        let dateDiff = getHumanizedDateDiff(
          Date.now(),
          blockInterval ? (
            auction.getSaleConfig().start.minus(
              blockNumber
            ).times(blockInterval.toString()).toNumber()
          ) : auction.getSaleConfig().start.minus(
            blockNumber
          ).times(AVERAGE_BLOCK_TIME).toNumber()
        )

        return `Starts in ${dateDiff}`
      }
    } else if (isActive) {
      if (!labelWithDuration) {
        return "Active";
      } else {
        let dateDiff = getHumanizedDateDiff(
          Date.now(),
          blockInterval ? (
            auction.getSaleConfig().end.minus(
              blockNumber
            ).times(blockInterval.toString()).toNumber()
          ) : auction.getSaleConfig().end.minus(
            blockNumber
          ).times(AVERAGE_BLOCK_TIME).toNumber()
        )

        return `Ends in ${dateDiff}`
      }
    } else if (isEnded) {
      if (!labelWithDuration) {
        return "Ended";
      } else {
        let dateDiff = getHumanizedDateDiff(
          Date.now(),
          blockInterval ? (
            blockNumber.minus(
              auction.getSaleConfig().end
            ).times(blockInterval.toString()).toNumber()
          ) : blockNumber.minus(
            auction.getSaleConfig().end
          ).times(AVERAGE_BLOCK_TIME).toNumber()
        )

        return `Ended ${dateDiff}`
      }
    }
  }, [willBeActive, isActive, isEnded, labelWithDuration, blockInterval, auction, blockNumber])

  return (
    <Box display="flex" alignItems="center" gap={1.5} {...rest}>
      <FiberManualRecordIcon
        sx={{
          color: (
            isActive
              ? theme.palette.success.main
              : (
                isEnded
                  ? theme.palette.error.main
                  : theme.palette.warning.main
              )
          ),
        }}
      />
      <Typography variant="body1" {...LabelProps}>
        {getLabel()}
      </Typography>
    </Box>
  );
}
