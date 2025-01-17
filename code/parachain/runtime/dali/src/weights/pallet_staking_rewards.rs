
//! Autogenerated weights for `pallet_staking_rewards`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2022-10-26, STEPS: `2`, REPEAT: 2, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! HOSTNAME: `dev`, CPU: `<UNKNOWN>`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("dali-dev"), DB CACHE: 1024

// Executed Command:
// /nix/store/0apddjbvqpg9m33hfhxzxsja22scw95c-composable/bin/composable
// benchmark
// pallet
// --chain=dali-dev
// --execution=wasm
// --wasm-execution=compiled
// --wasm-instantiation-strategy=legacy-instance-reuse
// --pallet=*
// --extrinsic=*
// --steps=2
// --repeat=2
// --output=code/parachain/runtime/dali/src/weights

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::Weight};
use sp_std::marker::PhantomData;

/// Weight functions for `pallet_staking_rewards`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> pallet_staking_rewards::WeightInfo for WeightInfo<T> {
	// Storage: StakingRewards RewardPools (r:1 w:1)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: Fnft Collection (r:1 w:1)
	/// The range of component `r` is `[1, 10]`.
	fn create_reward_pool(r: u32, ) -> Weight {
		(43_472_000 as Weight)
			// Standard Error: 1_404_000
			.saturating_add((977_000 as Weight).saturating_mul(r as Weight))
			.saturating_add(T::DbWeight::get().reads(3 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: StakingRewards RewardPools (r:1 w:1)
	// Storage: Tokens Accounts (r:3 w:3)
	// Storage: Tokens TotalIssuance (r:2 w:1)
	// Storage: Fnft FinancialNftId (r:1 w:1)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: System Account (r:1 w:1)
	// Storage: Tokens Locks (r:2 w:2)
	// Storage: Fnft Instance (r:1 w:1)
	// Storage: Fnft Collection (r:1 w:0)
	// Storage: Fnft OwnerInstances (r:1 w:1)
	// Storage: Proxy Proxies (r:1 w:1)
	// Storage: StakingRewards Stakes (r:0 w:1)
	/// The range of component `r` is `[1, 10]`.
	fn stake(r: u32, ) -> Weight {
		(158_709_000 as Weight)
			// Standard Error: 1_353_000
			.saturating_add((524_000 as Weight).saturating_mul(r as Weight))
			.saturating_add(T::DbWeight::get().reads(15 as Weight))
			.saturating_add(T::DbWeight::get().writes(13 as Weight))
	}
	// Storage: Fnft Instance (r:1 w:0)
	// Storage: StakingRewards Stakes (r:1 w:1)
	// Storage: StakingRewards RewardPools (r:1 w:1)
	// Storage: Tokens Accounts (r:3 w:3)
	// Storage: Tokens TotalIssuance (r:2 w:1)
	// Storage: Tokens Locks (r:2 w:2)
	// Storage: Timestamp Now (r:1 w:0)
	/// The range of component `r` is `[1, 10]`.
	fn extend(r: u32, ) -> Weight {
		(105_633_000 as Weight)
			// Standard Error: 1_183_000
			.saturating_add((1_255_000 as Weight).saturating_mul(r as Weight))
			.saturating_add(T::DbWeight::get().reads(11 as Weight))
			.saturating_add(T::DbWeight::get().writes(8 as Weight))
	}
	// Storage: Fnft Instance (r:1 w:1)
	// Storage: StakingRewards Stakes (r:1 w:1)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: StakingRewards RewardPools (r:1 w:1)
	// Storage: Tokens TotalIssuance (r:1 w:1)
	// Storage: Tokens Locks (r:2 w:2)
	// Storage: Tokens Accounts (r:4 w:4)
	// Storage: System Account (r:2 w:2)
	// Storage: Fnft OwnerInstances (r:1 w:1)
	/// The range of component `r` is `[1, 10]`.
	fn unstake(r: u32, ) -> Weight {
		(143_743_000 as Weight)
			// Standard Error: 1_027_000
			.saturating_add((6_979_000 as Weight).saturating_mul(r as Weight))
			.saturating_add(T::DbWeight::get().reads(14 as Weight))
			.saturating_add(T::DbWeight::get().writes(13 as Weight))
	}
	// Storage: Fnft Instance (r:2 w:1)
	// Storage: StakingRewards Stakes (r:1 w:2)
	// Storage: StakingRewards RewardPools (r:1 w:0)
	// Storage: Fnft FinancialNftId (r:1 w:1)
	// Storage: Fnft Collection (r:1 w:0)
	// Storage: Fnft OwnerInstances (r:1 w:1)
	// Storage: Proxy Proxies (r:1 w:1)
	// Storage: Tokens Locks (r:4 w:4)
	// Storage: Tokens Accounts (r:4 w:4)
	// Storage: System Account (r:2 w:1)
	/// The range of component `r` is `[1, 10]`.
	fn split(r: u32, ) -> Weight {
		(189_698_000 as Weight)
			// Standard Error: 758_000
			.saturating_add((1_029_000 as Weight).saturating_mul(r as Weight))
			.saturating_add(T::DbWeight::get().reads(18 as Weight))
			.saturating_add(T::DbWeight::get().writes(15 as Weight))
	}
	// Storage: System Account (r:1 w:0)
	// Storage: StakingRewards RewardsPotIsEmpty (r:1 w:1)
	fn reward_accumulation_hook_reward_update_calculation() -> Weight {
		(26_126_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Timestamp Now (r:1 w:0)
	fn unix_time_now() -> Weight {
		(3_334_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
	}
	// Storage: StakingRewards RewardPools (r:1 w:1)
	// Storage: Timestamp Now (r:1 w:0)
	/// The range of component `r` is `[1, 10]`.
	fn update_rewards_pool(r: u32, ) -> Weight {
		(32_787_000 as Weight)
			// Standard Error: 697_000
			.saturating_add((130_000 as Weight).saturating_mul(r as Weight))
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Fnft Instance (r:1 w:0)
	// Storage: StakingRewards Stakes (r:1 w:1)
	// Storage: StakingRewards RewardPools (r:1 w:1)
	// Storage: Tokens TotalIssuance (r:1 w:0)
	/// The range of component `r` is `[1, 10]`.
	fn claim(r: u32, ) -> Weight {
		(39_483_000 as Weight)
			// Standard Error: 418_000
			.saturating_add((1_930_000 as Weight).saturating_mul(r as Weight))
			.saturating_add(T::DbWeight::get().reads(4 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: StakingRewards RewardPools (r:1 w:0)
	// Storage: Tokens Accounts (r:2 w:2)
	// Storage: System Account (r:1 w:1)
	// Storage: StakingRewards RewardsPotIsEmpty (r:0 w:1)
	fn add_to_rewards_pot() -> Weight {
		(70_625_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(4 as Weight))
			.saturating_add(T::DbWeight::get().writes(4 as Weight))
	}
}
