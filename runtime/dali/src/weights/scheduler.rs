
//! Autogenerated weights for `scheduler`
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

/// Weight functions for `scheduler`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> scheduler::WeightInfo for WeightInfo<T> {
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Preimage PreimageFor (r:1 w:1)
	// Storage: Preimage StatusFor (r:1 w:1)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_periodic_named_resolved(s: u32, ) -> Weight {
		(19_275_000 as Weight)
			// Standard Error: 31_000
			.saturating_add((48_542_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((3 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((4 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	// Storage: Preimage PreimageFor (r:1 w:1)
	// Storage: Preimage StatusFor (r:1 w:1)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_named_resolved(s: u32, ) -> Weight {
		(14_722_000 as Weight)
			// Standard Error: 36_000
			.saturating_add((38_379_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((2 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((3 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Preimage PreimageFor (r:1 w:1)
	// Storage: Preimage StatusFor (r:1 w:1)
	fn on_initialize_periodic_resolved(s: u32, ) -> Weight {
		(12_559_000 as Weight)
			// Standard Error: 34_000
			.saturating_add((42_210_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((3 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((3 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	// Storage: Preimage PreimageFor (r:1 w:1)
	// Storage: Preimage StatusFor (r:1 w:1)
	fn on_initialize_resolved(s: u32, ) -> Weight {
		(13_081_000 as Weight)
			// Standard Error: 32_000
			.saturating_add((35_663_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((2 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((2 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Preimage PreimageFor (r:1 w:0)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_named_aborted(s: u32, ) -> Weight {
		(12_204_000 as Weight)
			// Standard Error: 16_000
			.saturating_add((17_269_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
			.saturating_add(T::DbWeight::get().writes((1 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Preimage PreimageFor (r:1 w:0)
	fn on_initialize_aborted(s: u32, ) -> Weight {
		(14_264_000 as Weight)
			// Standard Error: 17_000
			.saturating_add((10_895_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_periodic_named(s: u32, ) -> Weight {
		(26_964_000 as Weight)
			// Standard Error: 31_000
			.saturating_add((25_908_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((2 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	fn on_initialize_periodic(s: u32, ) -> Weight {
		(21_495_000 as Weight)
			// Standard Error: 28_000
			.saturating_add((19_745_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((1 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_named(s: u32, ) -> Weight {
		(25_252_000 as Weight)
			// Standard Error: 18_000
			.saturating_add((15_812_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((1 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	fn on_initialize(s: u32, ) -> Weight {
		(23_587_000 as Weight)
			// Standard Error: 21_000
			.saturating_add((13_446_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	fn schedule(s: u32, ) -> Weight {
		(32_608_000 as Weight)
			// Standard Error: 3_000
			.saturating_add((177_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn cancel(s: u32, ) -> Weight {
		(31_634_000 as Weight)
			// Standard Error: 8_000
			.saturating_add((2_904_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Scheduler Lookup (r:1 w:1)
	// Storage: Scheduler Agenda (r:1 w:1)
	fn schedule_named(s: u32, ) -> Weight {
		(40_178_000 as Weight)
			// Standard Error: 4_000
			.saturating_add((186_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Scheduler Lookup (r:1 w:1)
	// Storage: Scheduler Agenda (r:1 w:1)
	fn cancel_named(s: u32, ) -> Weight {
		(35_669_000 as Weight)
			// Standard Error: 9_000
			.saturating_add((2_899_000 as Weight).saturating_mul(s as Weight))
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
}
