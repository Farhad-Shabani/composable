import { Circle } from "@mui/icons-material";
import { alpha, Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import Image from "next/image";
import { getImageURL } from "@/utils/nextImageUrl";

type AccountIndicatorProps = {
  network: "polkadot" | "metamask";
  label: string;
  onClick: () => void;
};

export const AccountIndicator: React.FC<AccountIndicatorProps> = ({
  network,
  label,
  onClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const icon =
    network === "polkadot"
      ? getImageURL("/networks/polkadot_js_wallet.svg")
      : getImageURL("/networks/mainnet.svg");

  return (
    <Paper
      onClick={onClick}
      sx={{
        display: "grid",
        justifyItems: "center",
        alignContent: "center",
        gridTemplateColumns: "24px auto 24px",
        gap: theme.spacing(2),
        flexShrink: 0,
        minWidth: theme.spacing(31.25),
        background: alpha(
          theme.palette.primary.main,
          theme.custom.opacity.light
        ),
        cursor: "pointer",
        "&:hover": {
          background: alpha(
            theme.palette.primary.main,
            theme.custom.opacity.main
          )
        }
      }}
    >
      <Box sx={{ width: theme.spacing(3), height: theme.spacing(3) }}>
        <Image src={icon} width="24" height="24" alt="Account" />
      </Box>
      {isMobile ? (
        <Circle fontSize="large" sx={{ fontSize: 28 }} />
      ) : (
        <Typography variant="body2">{label}</Typography>
      )}
    </Paper>
  );
};
