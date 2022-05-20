
//! Autogenerated weights for `dex_router`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2022-05-20, STEPS: `50`, REPEAT: 20, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("dali-dev"), DB CACHE: 1024

// Executed Command:
// ./target/release/composable
// benchmark
// pallet
// --chain=dali-dev
// --execution=wasm
// --wasm-execution=compiled
// --pallet=*
// --extrinsic=*
// --steps=50
// --repeat=20
// --output=runtime/dali/src/weights
// --log
// error

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::Weight};
use sp_std::marker::PhantomData;

/// Weight functions for `dex_router`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> dex_router::WeightInfo for WeightInfo<T> {
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: Pablo Pools (r:4 w:0)
	// Storage: DexRouter DexRoutes (r:2 w:1)
	fn update_route() -> Weight {
		(75_739_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(7 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: DexRouter DexRoutes (r:2 w:0)
	// Storage: Pablo Pools (r:4 w:0)
	// Storage: Tokens Accounts (r:13 w:13)
	// Storage: System Account (r:4 w:0)
	// Storage: Pablo PriceCumulativeState (r:4 w:4)
	fn exchange() -> Weight {
		(481_476_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(28 as Weight))
			.saturating_add(T::DbWeight::get().writes(18 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: DexRouter DexRoutes (r:1 w:0)
	// Storage: Pablo Pools (r:4 w:0)
	// Storage: Tokens Accounts (r:13 w:13)
	// Storage: System Account (r:4 w:0)
	// Storage: Pablo PriceCumulativeState (r:4 w:4)
	fn buy() -> Weight {
		(589_184_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(27 as Weight))
			.saturating_add(T::DbWeight::get().writes(18 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: DexRouter DexRoutes (r:1 w:0)
	// Storage: Pablo Pools (r:4 w:0)
	// Storage: Tokens Accounts (r:13 w:13)
	// Storage: System Account (r:4 w:0)
	// Storage: Pablo PriceCumulativeState (r:4 w:4)
	fn sell() -> Weight {
		(490_667_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(27 as Weight))
			.saturating_add(T::DbWeight::get().writes(18 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: DexRouter DexRoutes (r:1 w:0)
	// Storage: Pablo Pools (r:1 w:0)
	// Storage: Tokens Accounts (r:5 w:5)
	// Storage: Tokens TotalIssuance (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	// Storage: Pablo PriceCumulativeState (r:1 w:1)
	fn add_liquidity() -> Weight {
		(207_974_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(11 as Weight))
			.saturating_add(T::DbWeight::get().writes(9 as Weight))
	}
	// Storage: unknown [0x3a7472616e73616374696f6e5f6c6576656c3a] (r:1 w:1)
	// Storage: DexRouter DexRoutes (r:1 w:0)
	// Storage: Pablo Pools (r:1 w:0)
	// Storage: Tokens Accounts (r:3 w:1)
	// Storage: Tokens TotalIssuance (r:1 w:1)
	// Storage: Pablo PriceCumulativeState (r:1 w:1)
	fn remove_liquidity() -> Weight {
		(98_079_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(8 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
}
