//! Autogenerated weights for cosmwasm
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2022-10-14, STEPS: `50`, REPEAT: 20, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! HOSTNAME: `dev`, CPU: `<UNKNOWN>`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("dali-dev"), DB CACHE: 1024

// Executed Command:
// ./target/release/composable
// benchmark
// pallet
// --chain
// dali-dev
// --execution=wasm
// --wasm-execution=compiled
// --wasm-instantiation-strategy=legacy-instance-reuse
// --pallet=cosmwasm
// --extrinsic=*
// --steps=50
// --repeat=20
// --output
// parachain/frame/cosmwasm/src/weights.rs
// --template
// frame-weight-template.hbs

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]
#![allow(trivial_numeric_casts)]

use frame_support::{traits::Get, weights::{Weight, constants::RocksDbWeight}};
use sp_std::marker::PhantomData;

/// Weight functions needed for cosmwasm.
pub trait WeightInfo {
	fn upload(n: u32, ) -> Weight;
	fn instantiate(n: u32, ) -> Weight;
	fn execute(n: u32, ) -> Weight;
	fn db_read() -> Weight;
	fn db_read_other_contract() -> Weight;
	fn db_write() -> Weight;
	fn db_scan() -> Weight;
	fn db_next() -> Weight;
	fn db_remove() -> Weight;
	fn balance() -> Weight;
	fn transfer(n: u32, ) -> Weight;
	fn set_contract_meta() -> Weight;
	fn running_contract_meta() -> Weight;
	fn contract_meta() -> Weight;
	fn addr_validate() -> Weight;
	fn addr_canonicalize() -> Weight;
	fn addr_humanize() -> Weight;
	fn secp256k1_recover_pubkey() -> Weight;
	fn secp256k1_verify() -> Weight;
	fn ed25519_verify() -> Weight;
	fn ed25519_batch_verify() -> Weight;
	fn continue_instantiate(n: u32, ) -> Weight;
	fn continue_execute(n: u32, ) -> Weight;
	fn continue_migrate() -> Weight;
	fn query_info() -> Weight;
	fn query_continuation() -> Weight;
	fn query_raw() -> Weight;
	fn migrate() -> Weight;
}

/// Weights for cosmwasm using the Substrate node and recommended hardware.
pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for SubstrateWeight<T> {
	fn migrate() -> Weight {
		10_000 as Weight
	}
	// Storage: Cosmwasm CodeHashToId (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	// Storage: Cosmwasm CurrentCodeId (r:1 w:1)
	// Storage: Cosmwasm PristineCode (r:0 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:0 w:1)
	// Storage: Cosmwasm CodeIdToInfo (r:0 w:1)
	/// The range of component `n` is `[1, 514288]`.
	fn upload(n: u32, ) -> Weight {
		(277_545_000 as Weight)
			// Standard Error: 0
			.saturating_add((45_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(T::DbWeight::get().reads(3 as Weight))
			.saturating_add(T::DbWeight::get().writes(6 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm ContractToInfo (r:1 w:1)
	// Storage: Cosmwasm CurrentNonce (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: System Account (r:2 w:2)
	// Storage: Tokens Accounts (r:2 w:2)
	/// The range of component `n` is `[0, 17]`.
	fn instantiate(n: u32, ) -> Weight {
		(1_149_724_000 as Weight)
			// Standard Error: 232_000
			.saturating_add((19_092_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().reads((2 as Weight).saturating_mul(n as Weight)))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
			.saturating_add(T::DbWeight::get().writes((2 as Weight).saturating_mul(n as Weight)))
	}
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: System Account (r:2 w:2)
	// Storage: Tokens Accounts (r:2 w:2)
	/// The range of component `n` is `[0, 17]`.
	fn execute(n: u32, ) -> Weight {
		(1_082_568_000 as Weight)
			// Standard Error: 95_000
			.saturating_add((23_147_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().reads((2 as Weight).saturating_mul(n as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((2 as Weight).saturating_mul(n as Weight)))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0xe9a804b2e527fd3601d2ffc0bb023cd668656c6c6f20776f726c64] (r:1 w:0)
	fn db_read() -> Weight {
		(208_915_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0xe9a804b2e527fd3601d2ffc0bb023cd668656c6c6f20776f726c64] (r:1 w:0)
	fn db_read_other_contract() -> Weight {
		(209_624_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0x46fb7408d4f285228f4af516ea25851b68656c6c6f] (r:1 w:1)
	fn db_write() -> Weight {
		(209_498_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	fn db_scan() -> Weight {
		(204_624_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(4 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0x] (r:1 w:0)
	fn db_next() -> Weight {
		(225_873_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0x46fb7408d4f285228f4af516ea25851b68656c6c6f] (r:1 w:1)
	fn db_remove() -> Weight {
		(212_499_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Tokens Accounts (r:1 w:0)
	fn balance() -> Weight {
		(2_917_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
	}
	// Storage: System Account (r:2 w:2)
	// Storage: Tokens Accounts (r:2 w:2)
	/// The range of component `n` is `[0, 17]`.
	fn transfer(n: u32, ) -> Weight {
		(9_622_000 as Weight)
			// Standard Error: 41_000
			.saturating_add((21_584_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(T::DbWeight::get().reads((2 as Weight).saturating_mul(n as Weight)))
			.saturating_add(T::DbWeight::get().writes((2 as Weight).saturating_mul(n as Weight)))
	}
	// Storage: Cosmwasm ContractToInfo (r:1 w:1)
	fn set_contract_meta() -> Weight {
		(5_292_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	fn running_contract_meta() -> Weight {
		(204_915_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(4 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	fn contract_meta() -> Weight {
		(3_458_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
	}
	fn addr_validate() -> Weight {
		(875_000 as Weight)
	}
	fn addr_canonicalize() -> Weight {
		(833_000 as Weight)
	}
	fn addr_humanize() -> Weight {
		(167_000 as Weight)
	}
	fn secp256k1_recover_pubkey() -> Weight {
		(33_917_000 as Weight)
	}
	fn secp256k1_verify() -> Weight {
		(250_000 as Weight)
	}
	fn ed25519_verify() -> Weight {
		(37_416_000 as Weight)
	}
	fn ed25519_batch_verify() -> Weight {
		(73_999_000 as Weight)
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:1)
	// Storage: Cosmwasm CurrentNonce (r:1 w:1)
	// Storage: System Account (r:2 w:2)
	// Storage: Tokens Accounts (r:2 w:2)
	/// The range of component `n` is `[0, 17]`.
	fn continue_instantiate(n: u32, ) -> Weight {
		(1_281_183_000 as Weight)
			// Standard Error: 1_887_000
			.saturating_add((23_964_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().reads((2 as Weight).saturating_mul(n as Weight)))
			.saturating_add(T::DbWeight::get().writes(3 as Weight))
			.saturating_add(T::DbWeight::get().writes((2 as Weight).saturating_mul(n as Weight)))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	/// The range of component `n` is `[0, 17]`.
	fn continue_execute(n: u32, ) -> Weight {
		(1_234_669_000 as Weight)
			// Standard Error: 674_000
			.saturating_add((3_348_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	fn continue_migrate() -> Weight {
		(1_079_324_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	fn query_info() -> Weight {
		(209_165_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	fn query_continuation() -> Weight {
		(1_098_032_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(5 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	// Storage: unknown [0x46fb7408d4f285228f4af516ea25851b68656c6c6f] (r:1 w:1)
	fn query_raw() -> Weight {
		(235_123_000 as Weight)
			.saturating_add(T::DbWeight::get().reads(6 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
}

// For backwards compatibility and tests
impl WeightInfo for () {
	// Storage: Cosmwasm CodeHashToId (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	// Storage: Cosmwasm CurrentCodeId (r:1 w:1)
	// Storage: Cosmwasm PristineCode (r:0 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:0 w:1)
	// Storage: Cosmwasm CodeIdToInfo (r:0 w:1)
	/// The range of component `n` is `[1, 514288]`.
	fn upload(n: u32, ) -> Weight {
		(277_545_000 as Weight)
			// Standard Error: 0
			.saturating_add((45_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(RocksDbWeight::get().reads(3 as Weight))
			.saturating_add(RocksDbWeight::get().writes(6 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm ContractToInfo (r:1 w:1)
	// Storage: Cosmwasm CurrentNonce (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: System Account (r:2 w:2)
	// Storage: Tokens Accounts (r:2 w:2)
	/// The range of component `n` is `[0, 17]`.
	fn instantiate(n: u32, ) -> Weight {
		(1_149_724_000 as Weight)
			// Standard Error: 232_000
			.saturating_add((19_092_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(RocksDbWeight::get().reads(6 as Weight))
			.saturating_add(RocksDbWeight::get().reads((2 as Weight).saturating_mul(n as Weight)))
			.saturating_add(RocksDbWeight::get().writes(3 as Weight))
			.saturating_add(RocksDbWeight::get().writes((2 as Weight).saturating_mul(n as Weight)))
	}
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: System Account (r:2 w:2)
	// Storage: Tokens Accounts (r:2 w:2)
	/// The range of component `n` is `[0, 17]`.
	fn execute(n: u32, ) -> Weight {
		(1_082_568_000 as Weight)
			// Standard Error: 95_000
			.saturating_add((23_147_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().reads((2 as Weight).saturating_mul(n as Weight)))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
			.saturating_add(RocksDbWeight::get().writes((2 as Weight).saturating_mul(n as Weight)))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0xe9a804b2e527fd3601d2ffc0bb023cd668656c6c6f20776f726c64] (r:1 w:0)
	fn db_read() -> Weight {
		(208_915_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0xe9a804b2e527fd3601d2ffc0bb023cd668656c6c6f20776f726c64] (r:1 w:0)
	fn db_read_other_contract() -> Weight {
		(209_624_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0x46fb7408d4f285228f4af516ea25851b68656c6c6f] (r:1 w:1)
	fn db_write() -> Weight {
		(209_498_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(2 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	fn db_scan() -> Weight {
		(204_624_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(4 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0x] (r:1 w:0)
	fn db_next() -> Weight {
		(225_873_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: unknown [0x46fb7408d4f285228f4af516ea25851b68656c6c6f] (r:1 w:1)
	fn db_remove() -> Weight {
		(212_499_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(2 as Weight))
	}
	// Storage: Tokens Accounts (r:1 w:0)
	fn balance() -> Weight {
		(2_917_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(1 as Weight))
	}
	// Storage: System Account (r:2 w:2)
	// Storage: Tokens Accounts (r:2 w:2)
	/// The range of component `n` is `[0, 17]`.
	fn transfer(n: u32, ) -> Weight {
		(9_622_000 as Weight)
			// Standard Error: 41_000
			.saturating_add((21_584_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(RocksDbWeight::get().reads((2 as Weight).saturating_mul(n as Weight)))
			.saturating_add(RocksDbWeight::get().writes((2 as Weight).saturating_mul(n as Weight)))
	}
	// Storage: Cosmwasm ContractToInfo (r:1 w:1)
	fn set_contract_meta() -> Weight {
		(5_292_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(1 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	fn running_contract_meta() -> Weight {
		(204_915_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(4 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	fn contract_meta() -> Weight {
		(3_458_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(1 as Weight))
	}
	fn addr_validate() -> Weight {
		(875_000 as Weight)
	}
	fn addr_canonicalize() -> Weight {
		(833_000 as Weight)
	}
	fn addr_humanize() -> Weight {
		(167_000 as Weight)
	}
	fn secp256k1_recover_pubkey() -> Weight {
		(33_917_000 as Weight)
	}
	fn secp256k1_verify() -> Weight {
		(250_000 as Weight)
	}
	fn ed25519_verify() -> Weight {
		(37_416_000 as Weight)
	}
	fn ed25519_batch_verify() -> Weight {
		(73_999_000 as Weight)
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:1)
	// Storage: Cosmwasm CurrentNonce (r:1 w:1)
	// Storage: System Account (r:2 w:2)
	// Storage: Tokens Accounts (r:2 w:2)
	/// The range of component `n` is `[0, 17]`.
	fn continue_instantiate(n: u32, ) -> Weight {
		(1_281_183_000 as Weight)
			// Standard Error: 1_887_000
			.saturating_add((23_964_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(RocksDbWeight::get().reads(6 as Weight))
			.saturating_add(RocksDbWeight::get().reads((2 as Weight).saturating_mul(n as Weight)))
			.saturating_add(RocksDbWeight::get().writes(3 as Weight))
			.saturating_add(RocksDbWeight::get().writes((2 as Weight).saturating_mul(n as Weight)))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	/// The range of component `n` is `[0, 17]`.
	fn continue_execute(n: u32, ) -> Weight {
		(1_234_669_000 as Weight)
			// Standard Error: 674_000
			.saturating_add((3_348_000 as Weight).saturating_mul(n as Weight))
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	fn continue_migrate() -> Weight {
		(1_079_324_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	fn query_info() -> Weight {
		(209_165_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	fn query_continuation() -> Weight {
		(1_098_032_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(5 as Weight))
			.saturating_add(RocksDbWeight::get().writes(1 as Weight))
	}
	// Storage: Cosmwasm CodeIdToInfo (r:1 w:1)
	// Storage: Cosmwasm InstrumentedCode (r:1 w:0)
	// Storage: Timestamp Now (r:1 w:0)
	// Storage: unknown [0x3a65787472696e7369635f696e646578] (r:1 w:0)
	// Storage: Cosmwasm ContractToInfo (r:1 w:0)
	// Storage: unknown [0x46fb7408d4f285228f4af516ea25851b68656c6c6f] (r:1 w:1)
	fn query_raw() -> Weight {
		(235_123_000 as Weight)
			.saturating_add(RocksDbWeight::get().reads(6 as Weight))
			.saturating_add(RocksDbWeight::get().writes(2 as Weight))
	}

	fn migrate() -> Weight {
		10_000 as Weight
	}
}
