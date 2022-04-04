use crate as pallet_instrumental;

use pallet_instrumental::currency::{CurrencyId, PICA};
use pallet_instrumental::account_id::*;

use composable_traits::governance::{GovernanceRegistry, SignedRawOrigin};
use frame_support::ord_parameter_types;
use frame_system::{EnsureRoot, EnsureSignedBy};
use frame_support::{
	parameter_types,
	PalletId,
	traits::{Everything, GenesisBuild},
};

use sp_runtime::traits::AccountIdConversion;
use sp_runtime::{
	testing::Header,
	traits::{ConvertInto, IdentityLookup}
};
use sp_core::{
	H256,
};

use orml_traits::{GetByKey, parameter_type_with_key};

pub type BlockNumber = u64;
pub type Balance = u128;
pub type VaultId = u64;
pub type Amount = i128;

pub const VAULT_PALLET_ID: PalletId = PalletId(*b"cubic___");
pub const NATIVE_ASSET: CurrencyId = PICA::ID;
	
// ----------------------------------------------------------------------------------------------------
//                                                Config                                               
// ----------------------------------------------------------------------------------------------------

parameter_types! {
	pub const BlockHashCount: u64 = 250;
}

impl frame_system::Config for MockRuntime {
	type Origin = Origin;
	type Index = u64;
	type BlockNumber = BlockNumber;
	type Call = Call;
	type Hash = H256;
	type Hashing = ::sp_runtime::traits::BlakeTwo256;
	type AccountId = AccountId;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Header = Header;
	type Event = Event;
	type BlockHashCount = BlockHashCount;
	type BlockWeights = ();
	type BlockLength = ();
	type Version = ();
	type PalletInfo = PalletInfo;
	type AccountData = pallet_balances::AccountData<Balance>;
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type DbWeight = ();
	type BaseCallFilter = Everything;
	type SystemWeightInfo = ();
	type SS58Prefix = ();
	type OnSetCode = ();
	type MaxConsumers = frame_support::traits::ConstU32<16>;
}

// ----------------------------------------------------------------------------------------------------
//                                                Balances                                               
// ----------------------------------------------------------------------------------------------------

parameter_types! {
	pub const BalanceExistentialDeposit: u64 = 1;
}

impl pallet_balances::Config for MockRuntime {
	type Balance = Balance;
	type Event = Event;
	type DustRemoval = ();
	type ExistentialDeposit = BalanceExistentialDeposit;
	type AccountStore = System;
	type WeightInfo = ();
	type MaxLocks = ();
	type MaxReserves = ();
	type ReserveIdentifier = [u8; 8];
}

// ----------------------------------------------------------------------------------------------------
//                                                Tokens                                               
// ----------------------------------------------------------------------------------------------------

parameter_type_with_key! {
	pub ExistentialDeposits: |_currency_id: CurrencyId| -> Balance {
		0u128
	};
}

impl orml_tokens::Config for MockRuntime {
	type Event = Event;
	type Balance = Balance;
	type Amount = Amount;
	type CurrencyId = CurrencyId;
	type WeightInfo = ();
	type ExistentialDeposits = ExistentialDeposits;
	type OnDust = ();
	type MaxLocks = ();
	type DustRemovalWhitelist = Everything;
}

// ----------------------------------------------------------------------------------------------------
//                                           Currency Factory                                          
// ----------------------------------------------------------------------------------------------------

impl pallet_currency_factory::Config for MockRuntime {
	type Event = Event;
	type AssetId = CurrencyId;
	type AddOrigin = EnsureRoot<AccountId>;
	type ReserveOrigin = EnsureRoot<AccountId>;
	type WeightInfo = ();
}

// ----------------------------------------------------------------------------------------------------
//                                                Assets                                               
// ----------------------------------------------------------------------------------------------------

ord_parameter_types! {
	pub const RootAccount: AccountId = ALICE;
}

parameter_types! {
	pub const NativeAssetId: CurrencyId = NATIVE_ASSET;
}

pub struct NoopRegistry;

impl<CurrencyId, AccountId> GovernanceRegistry<CurrencyId, AccountId> for NoopRegistry {
	fn set(_k: CurrencyId, _value: SignedRawOrigin<AccountId>) {}
}

impl<CurrencyId>
	GetByKey<
		CurrencyId,
		Result<SignedRawOrigin<sp_core::sr25519::Public>, sp_runtime::DispatchError>,
	> for NoopRegistry
{
	fn get(
		_k: &CurrencyId,
	) -> Result<SignedRawOrigin<sp_core::sr25519::Public>, sp_runtime::DispatchError> {
		Ok(SignedRawOrigin::Root)
	}
}

impl pallet_assets::Config for MockRuntime {
	type NativeAssetId = NativeAssetId;
	type GenerateCurrencyId = LpTokenFactory;
	type AssetId = CurrencyId;
	type Balance = Balance;
	type NativeCurrency = Balances;
	type MultiCurrency = Tokens;
	type WeightInfo = ();
	type AdminOrigin = EnsureSignedBy<RootAccount, AccountId>;
	type GovernanceRegistry = NoopRegistry;
}

// ----------------------------------------------------------------------------------------------------
//                                                Vault                                                
// ----------------------------------------------------------------------------------------------------

parameter_types! {
	pub const MaxStrategies: usize = 255;
	pub const CreationDeposit: Balance = 10;
	pub const ExistentialDeposit: Balance = 1000;
	pub const RentPerBlock: Balance = 1;
	pub const MinimumDeposit: Balance = 0;
	pub const MinimumWithdrawal: Balance = 0;
	pub const VaultPalletId: PalletId = VAULT_PALLET_ID;
  	pub const TombstoneDuration: u64 = 42;
}

impl pallet_vault::Config for MockRuntime {
	type Event = Event;
	type Currency = Assets;
	type AssetId = CurrencyId;
	type Balance = Balance;
	type MaxStrategies = MaxStrategies;
	type CurrencyFactory = LpTokenFactory;
	type Convert = ConvertInto;
	type MinimumDeposit = MinimumDeposit;
	type MinimumWithdrawal = MinimumWithdrawal;
	type CreationDeposit = CreationDeposit;
	type ExistentialDeposit = ExistentialDeposit;
	type RentPerBlock = RentPerBlock;
	type NativeCurrency = Assets;
	type VaultId = VaultId;
	type TombstoneDuration = TombstoneDuration;
	type WeightInfo = ();
	type PalletId = VaultPalletId;
}

// ----------------------------------------------------------------------------------------------------
//                                             Instrumental                                            
// ----------------------------------------------------------------------------------------------------

parameter_types! {
	pub const InstrumentalPalletId: PalletId = PalletId(*b"strm____");
}

impl pallet_instrumental::Config for MockRuntime {
	type Event = Event;
	type WeightInfo = ();
	type Balance = Balance;
	type AssetId = CurrencyId;
	type VaultId = VaultId;
	type Vault = Vault;
	type PalletId = InstrumentalPalletId;
}

// ----------------------------------------------------------------------------------------------------
//                                           Construct Runtime                                         
// ----------------------------------------------------------------------------------------------------

type UncheckedExtrinsic = frame_system::mocking::MockUncheckedExtrinsic<MockRuntime>;
type Block = frame_system::mocking::MockBlock<MockRuntime>;

frame_support::construct_runtime!(
	pub enum MockRuntime where
		Block = Block,
		NodeBlock = Block,
		UncheckedExtrinsic = UncheckedExtrinsic,
	{
		System: frame_system::{Pallet, Call, Storage, Config, Event<T>},
		Balances: pallet_balances::{Pallet, Call, Storage, Event<T>},
		Tokens: orml_tokens::{Pallet, Storage, Event<T>, Config<T>},
		Assets: pallet_assets::{Pallet, Call, Storage},

		LpTokenFactory: pallet_currency_factory::{Pallet, Storage, Event<T>},

		Vault: pallet_vault::{Pallet, Call, Storage, Event<T>},
		Instrumental: pallet_instrumental::{Pallet, Call, Storage, Event<T>},
	}
);

#[derive(Default)]
pub struct ExtBuilder {
	native_balances: Vec<(AccountId, Balance)>,
	balances: Vec<(AccountId, CurrencyId, Balance)>,
	// TODO: (Nevin)
	//  - add genesis config for Vault pallet 
	vault_count: u64,
	// TODO: (Nevin)
	//  - add genesis config for Instrumental pallet 
	// asset_vaults: Vec<(CurrencyId, VaultId)>,
}

impl ExtBuilder {
	pub fn build(self) -> sp_io::TestExternalities {
		let mut storage = frame_system::GenesisConfig::default().build_storage::<MockRuntime>().unwrap();
		
		pallet_balances::GenesisConfig::<MockRuntime> { balances: self.native_balances }
			.assimilate_storage(&mut storage)
			.unwrap();

		orml_tokens::GenesisConfig::<MockRuntime> { balances: self.balances }
			.assimilate_storage(&mut storage)
			.unwrap();

		storage.into()
	}

	pub fn initialize_balance(mut self, user: AccountId, asset: CurrencyId, balance: Balance) -> ExtBuilder {
		if asset == NATIVE_ASSET {
			self.native_balances.push((user, balance));
		} else {
			self.balances.push((user, asset, balance));
		}

		self
	}

	pub fn initialize_balances(mut self, balances: Vec<(AccountId, CurrencyId, Balance)>) -> ExtBuilder {
		balances.into_iter()
		    .for_each(|(account, asset, balance)| {
				if asset == NATIVE_ASSET {
					self.native_balances.push((account, balance));
				} else {
					self.balances.push((account, asset, balance));
				}
			});

		self
	}

	pub fn initialize_vault(mut self, asset: CurrencyId, balance: Balance) -> ExtBuilder {
		self.vault_count += 1;
		let vault_id = self.vault_count;

		let vault_account = VAULT_PALLET_ID.into_sub_account(&vault_id);
		if asset == NATIVE_ASSET {
			self.native_balances.push((vault_account, balance));
		} else {
			self.balances.push((vault_account, asset, balance));
		}
		
		self
	}

	pub fn initialize_vaults(mut self, reserves: Vec<(CurrencyId, Balance)>) -> ExtBuilder {
		reserves.into_iter().for_each(|(asset, balance)| {
			self.vault_count += 1;
			let vault_id = self.vault_count;

			let vault_account = VAULT_PALLET_ID.into_sub_account(&vault_id);
			if asset == NATIVE_ASSET {
				self.native_balances.push((vault_account, balance));
			} else {
				self.balances.push((vault_account, asset, balance));
			}
		});
		
		self
	}
}