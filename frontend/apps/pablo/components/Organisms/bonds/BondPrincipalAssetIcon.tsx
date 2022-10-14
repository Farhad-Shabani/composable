import { PairAsset, BaseAsset } from "@/components/Atoms";
import { LiquidityProviderToken, Asset } from "shared";

const BondPrincipalAssetIcon = ({
  bondedAsset,
}: {
  bondedAsset: LiquidityProviderToken | Asset | undefined;
}) => {
  if (bondedAsset instanceof LiquidityProviderToken) {
    const [base, quote] = bondedAsset.getUnderlyingAssets();
    return base && quote && (
      <PairAsset
        assets={[
          {
            icon: base.getIconUrl(),
            label: base.getSymbol(),
          },
          {
            icon: quote.getIconUrl(),
            label: quote.getSymbol(),
          },
        ]}
        separator="/"
      />
    );
  }

  if (bondedAsset instanceof Asset) {
    return (
      <BaseAsset
        label={bondedAsset.getSymbol()}
        icon={bondedAsset.getIconUrl()}
      />
    );
  }

  return null;
};

export default BondPrincipalAssetIcon;