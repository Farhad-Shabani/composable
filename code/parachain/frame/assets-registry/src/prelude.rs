pub use composable_traits::{
    assets::Asset,
    currency::{
        AssetExistentialDepositInspect, BalanceLike, Exponent,AssetRatioInspect,
    },
    defi::Ratio,
    xcm::assets::{
        ForeignMetadata, RemoteAssetRegistryInspect,
        RemoteAssetRegistryMutate,
    },
};

pub use sp_runtime::Rational128 as Rational;