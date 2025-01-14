import { Box, Button, useTheme } from "@mui/material";
import { useState } from "react";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { PolkadotAccountListItem } from "./PolkadotAccountListItem";
import React from "react";

export const PolkadotAccountsSelection = ({
  accounts,
  onSelect,
  selectedAccount,
  disconnectWallet,
}: {
  accounts: InjectedAccountWithMeta[];
  onSelect: (account: InjectedAccountWithMeta) => void;
  selectedAccount?: InjectedAccountWithMeta;
  disconnectWallet: (() => Promise<void>) | undefined;
}) => {
  const theme = useTheme();
  const [selectedActiveAccount, setSelectedActiveAccount] = useState<
    InjectedAccountWithMeta | undefined
  >(selectedAccount);
  return (
    <>
      <Box
        sx={{
          marginTop: theme.spacing(2),
          height: "40vh",
          overflowY: "scroll",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {accounts.map((account) => (
          <PolkadotAccountListItem
            key={account.address}
            account={account}
            onSelect={setSelectedActiveAccount}
            isSelected={
              selectedActiveAccount?.address === account.address ?? false
            }
          />
        ))}
      </Box>

      <Button
        onClick={() => {
          if (selectedActiveAccount) {
            onSelect(selectedActiveAccount);
          }
        }}
        sx={{ marginTop: theme.spacing(2) }}
        fullWidth
        variant="contained"
        disabled={
          selectedAccount &&
          selectedActiveAccount &&
          selectedAccount.address === selectedActiveAccount.address
        }
      >
        Confirm Account
      </Button>
      <Button
        onClick={() => {
          if (disconnectWallet) {
            disconnectWallet();
          }
        }}
        sx={{ marginTop: theme.spacing(2) }}
        fullWidth
      >
        Disconnect
      </Button>
    </>
  );
};
