#![cfg_attr(
	not(test),
	deny(
		clippy::disallowed_methods,
		clippy::disallowed_types,
		clippy::indexing_slicing,
		clippy::todo,
		clippy::unwrap_used,
		clippy::panic
	)
)] // allow in tests
#![deny(clippy::unseparated_literal_suffix, clippy::disallowed_types)]
#![cfg_attr(not(feature = "std"), no_std)]
#![deny(
	bad_style,
	bare_trait_objects,
	const_err,
	improper_ctypes,
	non_shorthand_field_patterns,
	no_mangle_generic_items,
	overflowing_literals,
	path_statements,
	patterns_in_fns_without_body,
	private_in_public,
	unconditional_recursion,
	unused_allocation,
	unused_comparisons,
	unused_parens,
	while_true,
	trivial_casts,
	trivial_numeric_casts,
	unused_extern_crates
)]
#![doc = include_str!("../README.md")]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
	use composable_traits::{mosaic::TransferTo, xcvm::XCVM};
	use frame_support::{
		pallet_prelude::*,
		sp_runtime::{traits::Dispatchable, SaturatedConversion},
		traits::{
			fungibles::{
				Inspect as FungiblesInspect, Mutate as FungiblesMutate,
				Transfer as FungiblesTransfer,
			},
			tokens::{AssetId, Balance},
		},
		transactional, PalletId,
	};
	use frame_system::{ensure_signed, pallet_prelude::*, RawOrigin};
	use sp_runtime::traits::AccountIdConversion;
	use sp_std::{collections::vec_deque::VecDeque, vec::Vec};
	use xcvm_core::*;

	pub(crate) type AccountIdOf<T> = <T as frame_system::Config>::AccountId;
	pub(crate) type AssetIdOf<T> = <T as Config>::AssetId;
	pub(crate) type BalanceOf<T> = <T as Config>::Balance;
	pub(crate) type BridgeOf<T> = <T as Config>::Bridge;
	pub(crate) type BridgeTxIdOf<T> = <BridgeOf<T> as TransferTo>::TxId;
	pub(crate) type BridgeNetworkIdOf<T> = <BridgeOf<T> as TransferTo>::NetworkId;
	pub(crate) type ForeignAddress<T> = <BridgeOf<T> as TransferTo>::Address;
	pub(crate) type SatelliteOf<T> = (BridgeNetworkIdOf<T>, ForeignAddress<T>);

	pub(crate) type Program =
		XCVMProgram<VecDeque<XCVMInstruction<XCVMNetwork, Vec<u8>, Vec<u8>, XCVMTransfer>>>;

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		SatelliteSet {
			network: XCVMNetwork,
			satellite: SatelliteOf<T>,
		},
		Executed {
			salt: Vec<u8>,
			program: Program,
		},
		Spawn {
			network: XCVMNetwork,
			network_txs: Vec<BridgeTxIdOf<T>>,
			who: AccountIdOf<T>,
			salt: Vec<u8>,
			program: Vec<u8>,
		},
	}

	#[pallet::error]
	pub enum Error<T> {
		InvalidProgramEncoding,
		UnknownAsset,
		MalformedAccount,
		InvalidCallEncoding,
		CallFailed,
		UnknownNetwork,
	}

	#[pallet::config]
	pub trait Config: frame_system::Config {
		#[allow(missing_docs)]
		type Event: From<Event<Self>> + IsType<<Self as frame_system::Config>::Event>;
		type Dispatchable: Parameter + Dispatchable<Origin = Self::Origin>;
		type AssetId: AssetId + Ord + TryFrom<XCVMAsset>;
		type Assets: FungiblesInspect<
				AccountIdOf<Self>,
				AssetId = AssetIdOf<Self>,
				Balance = BalanceOf<Self>,
			> + FungiblesTransfer<AccountIdOf<Self>>
			+ FungiblesMutate<AccountIdOf<Self>>;
		type Balance: Balance;
		type Bridge: TransferTo<
			AccountId = AccountIdOf<Self>,
			AssetId = AssetIdOf<Self>,
			Balance = BalanceOf<Self>,
			BlockNumber = BlockNumberFor<Self>,
		>;
		type ControlOrigin: EnsureOrigin<Self::Origin>;
		#[pallet::constant]
		type MaxProgramSize: Get<u32>;
		#[pallet::constant]
		type PalletId: Get<PalletId>;
	}

	#[pallet::pallet]
	#[pallet::generate_store(pub(super) trait Store)]
	#[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	#[pallet::storage]
	#[pallet::getter(fn satellite)]
	pub type Satellite<T: Config> = StorageMap<_, Blake2_128Concat, XCVMNetwork, SatelliteOf<T>>;

	#[pallet::call]
	impl<T: Config> Pallet<T>
	where
		AccountIdOf<T>: for<'a> TryFrom<&'a [u8]> + AsRef<[u8]>,
	{
		#[pallet::weight(10_000)]
		pub fn set_satellite(
			origin: OriginFor<T>,
			network: XCVMNetwork,
			satellite: SatelliteOf<T>,
		) -> DispatchResultWithPostInfo {
			let _ = T::ControlOrigin::ensure_origin(origin)?;
			Satellite::<T>::insert(network, satellite.clone());
			Self::deposit_event(Event::<T>::SatelliteSet { network, satellite });
			Ok(().into())
		}

		#[pallet::weight(10_000)]
		#[transactional]
		pub fn execute(
			origin: OriginFor<T>,
			real_origin: Option<AccountIdOf<T>>,
			salt: Vec<u8>,
			funds: XCVMTransfer<Displayed<u128>>,
			program: Program,
		) -> DispatchResultWithPostInfo {
			let who = match real_origin {
				None => ensure_signed(origin.clone())?,
				Some(real_origin) => {
					let _ = T::ControlOrigin::ensure_origin(origin)?;
					real_origin
				},
			};
			Self::do_execute(&who, salt, funds, program)
		}

		#[pallet::weight(10_000)]
		#[transactional]
		pub fn execute_json_privileged(
			origin: OriginFor<T>,
			real_origin: AccountIdOf<T>,
			salt: Vec<u8>,
			funds: XCVMTransfer<Displayed<u128>>,
			program: Vec<u8>,
		) -> DispatchResultWithPostInfo {
			let _ = T::ControlOrigin::ensure_origin(origin)?;
			let who = real_origin;
			let program = xcvm_core::deserialize_json(&program)
				.map_err(|_| Error::<T>::InvalidProgramEncoding)?;
			for (asset, Displayed(amount)) in funds.clone().0 {
				let concrete_asset = TryInto::<AssetIdOf<T>>::try_into(asset)
					.map_err(|_| Error::<T>::UnknownAsset)?;
				T::Assets::mint_into(concrete_asset, &who, amount.saturated_into())?;
			}
			Self::do_execute(&who, salt, funds, program)
		}

		#[pallet::weight(10_000)]
		#[transactional]
		pub fn execute_json(
			origin: OriginFor<T>,
			real_origin: Option<AccountIdOf<T>>,
			salt: Vec<u8>,
			funds: XCVMTransfer<Displayed<u128>>,
			program: BoundedVec<u8, T::MaxProgramSize>,
		) -> DispatchResultWithPostInfo {
			let who = match real_origin {
				None => ensure_signed(origin.clone())?,
				Some(real_origin) => {
					let _ = T::ControlOrigin::ensure_origin(origin)?;
					real_origin
				},
			};
			let program = xcvm_core::deserialize_json(&program.into_inner())
				.map_err(|_| Error::<T>::InvalidProgramEncoding)?;
			Self::do_execute(&who, salt, funds, program)
		}

		#[pallet::weight(10_000)]
		#[transactional]
		pub fn execute_protobuf(
			origin: OriginFor<T>,
			real_origin: Option<AccountIdOf<T>>,
			salt: Vec<u8>,
			funds: XCVMTransfer<Displayed<u128>>,
			program: BoundedVec<u8, T::MaxProgramSize>,
		) -> DispatchResultWithPostInfo {
			let who = match real_origin {
				None => ensure_signed(origin.clone())?,
				Some(real_origin) => {
					let _ = T::ControlOrigin::ensure_origin(origin)?;
					real_origin
				},
			};
			let program = xcvm_protobuf::decode::<
				XCVMNetwork,
				<XCVMNetwork as Callable>::EncodedCall,
				Vec<u8>,
				XCVMTransfer,
			>(program.as_ref())
			.map_err(|_| Error::<T>::InvalidProgramEncoding)?;
			Self::do_execute(&who, salt, funds, program)
		}
	}

	impl<T: Config> Pallet<T> {
		pub(crate) fn program_account(mut salt: Vec<u8>, who: &AccountIdOf<T>) -> AccountIdOf<T> {
			salt.extend(who.encode());
			let address = sp_io::hashing::keccak_256(&salt);
			T::PalletId::get().into_sub_account(address)
		}

		pub(crate) fn actual_amount(
			asset: AssetIdOf<T>,
			amount: xcvm_core::Amount,
			who: &AccountIdOf<T>,
		) -> BalanceOf<T> {
			let balance = T::Assets::reducible_balance(asset, who, false);
			amount.apply(balance.saturated_into()).saturated_into()
		}
	}

	impl<T: Config> XCVM for Pallet<T>
	where
		AccountIdOf<T>: for<'a> TryFrom<&'a [u8]> + AsRef<[u8]>,
	{
		type AccountId = AccountIdOf<T>;
		type Input = (Vec<u8>, XCVMTransfer<Displayed<u128>>, Program);
		type Output = DispatchResult;
		fn execute(who: &Self::AccountId, (salt, funds, program): Self::Input) -> Self::Output {
			Self::do_execute(&who, salt, funds, program).map(|_| ()).map_err(|e| e.error)
		}
	}

	impl<T: Config> Pallet<T>
	where
		AccountIdOf<T>: for<'a> TryFrom<&'a [u8]> + AsRef<[u8]>,
	{
		fn do_execute(
			who: &AccountIdOf<T>,
			salt: Vec<u8>,
			XCVMTransfer(funds): XCVMTransfer<Displayed<u128>>,
			mut program: Program,
		) -> DispatchResultWithPostInfo {
			let program_account = Self::program_account(salt.clone(), who);
			for (asset, Displayed(amount)) in funds {
				let concrete_asset = TryInto::<AssetIdOf<T>>::try_into(asset)
					.map_err(|_| Error::<T>::UnknownAsset)?;
				T::Assets::transfer(
					concrete_asset,
					&who,
					&program_account,
					amount.saturated_into(),
					false,
				)?;
			}
			frame_support::log::debug!(target: "runtime::xcvm", "Program account {:?}", program_account.as_ref());
			let program_copy = program.clone();
			while let Some(instruction) = program.instructions.pop_front() {
				match instruction {
					XCVMInstruction::Transfer { to, assets: XCVMTransfer(assets) } => {
						let to = AccountIdOf::<T>::try_from(&to[..])
							.map_err(|_| Error::<T>::MalformedAccount)?;
						for (asset, amount) in assets {
							let concrete_asset = TryInto::<AssetIdOf<T>>::try_into(asset)
								.map_err(|_| Error::<T>::UnknownAsset)?;
							let actual_amount = Self::actual_amount(concrete_asset, amount, &program_account);
							T::Assets::transfer(
								concrete_asset,
								&program_account,
								&to,
								actual_amount,
								false,
							)?;
						}
					},
					XCVMInstruction::Call { encoded } => {
						let payload: Vec<u8> = encoded.into();
						let call = <T::Dispatchable as Decode>::decode(&mut &payload[..])
							.map_err(|_| Error::<T>::InvalidCallEncoding)?;
						call.dispatch(RawOrigin::Signed(who.clone()).into())
							.map_err(|e| e.error)?;
					},
					// If we want to spawn something from the same network, assume it's synchronous
					XCVMInstruction::Spawn {
						network: XCVMNetwork::PICASSO,
						salt: _,
						// we don't need to move the assets as we are just continuing
						assets: _,
						program: mut child_program,
					} => {
						// prepend child instructions
						child_program.instructions.append(&mut program.instructions);
						program.instructions = child_program.instructions;
					},
					XCVMInstruction::Spawn {
						network,
						salt,
						assets: XCVMTransfer(assets),
						program: child_program,
					} => {
						let (bridge_network_id, network_satellite) =
							Satellite::<T>::get(network).ok_or(Error::<T>::UnknownNetwork)?;
						let now = frame_system::Pallet::<T>::block_number();
						let network_txs = assets
							.into_iter()
							.map(|(asset, amount)| {
								let concrete_asset = TryInto::<AssetIdOf<T>>::try_into(asset)
									.map_err(|_| Error::<T>::UnknownAsset)?;
								let actual_amount =
									Self::actual_amount(concrete_asset, amount, &program_account);
								BridgeOf::<T>::transfer_to(
									program_account.clone(),
									bridge_network_id.clone(),
									network_satellite.clone(),
									concrete_asset,
									actual_amount,
									false,
									now,
								)
							})
							.collect::<Result<Vec<_>, _>>()?;
						Self::deposit_event(Event::<T>::Spawn {
							network,
							network_txs,
							who: who.clone(),
							salt,
							program: xcvm_core::serialize_json(&child_program)
								.map_err(|_| Error::<T>::InvalidProgramEncoding)?,
						});
					},
				}
			}
			Self::deposit_event(Event::<T>::Executed { salt, program: program_copy });
			Ok(().into())
		}
	}
}
