extern crate alloc;

use crate::{
	error::ContractError,
	msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, QueryMsg},
	state::{Config, CONFIG, IP_REGISTER, OWNERS, RESULT_REGISTER},
};
use alloc::borrow::Cow;
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{
	to_binary, wasm_execute, Addr, Binary, CosmosMsg, Deps, DepsMut, Env, Event, MessageInfo,
	QueryRequest, Reply, Response, StdError, StdResult, SubMsg, WasmQuery,
};
use cw2::set_contract_version;
use cw20::{BalanceResponse, Cw20Contract, Cw20ExecuteMsg, Cw20QueryMsg};
use cw_utils::ensure_from_older_version;
use cw_xcvm_asset_registry::msg::{GetAssetContractResponse, QueryMsg as AssetRegistryQueryMsg};
use num::Zero;
use prost::Message;
use serde::Serialize;
use xcvm_core::{cosmwasm::*, Amount, AssetId, Displayed, Funds, Register};
use xcvm_proto as proto;

const CONTRACT_NAME: &str = "composable:xcvm-interpreter";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");
const CALL_ID: u64 = 1;
const SELF_CALL_ID: u64 = 2;

/// Used for unwrapping must-have fields in protobuf
macro_rules! must_ok {
	($opt:expr) => {
		$opt.ok_or(ContractError::InvalidProgram)
	};
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
	deps: DepsMut,
	_env: Env,
	info: MessageInfo,
	msg: InstantiateMsg,
) -> Result<Response, ContractError> {
	set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

	let registry_address = deps.api.addr_validate(&msg.registry_address)?;
	let relayer_address = deps.api.addr_validate(&msg.relayer_address)?;
	let config = Config {
		registry_address,
		relayer_address,
		network_id: msg.network_id,
		user_id: msg.user_id.clone(),
	};
	CONFIG.save(deps.storage, &config)?;
	// Save the caller as owner, in this case it is `router`
	OWNERS.save(deps.storage, info.sender, &())?;

	Ok(Response::new().add_event(
		Event::new("xcvm.interpreter.instantiated").add_attribute(
			"data",
			to_binary(&(msg.network_id.0, msg.user_id))?.to_base64().as_str(),
		),
	))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
	deps: DepsMut,
	env: Env,
	info: MessageInfo,
	msg: ExecuteMsg,
) -> Result<Response, ContractError> {
	assert_owner(deps.as_ref(), &env.contract.address, &info.sender)?;
	match msg {
		ExecuteMsg::Execute { program } => initiate_execution(deps, env, program),
		ExecuteMsg::_SelfExecute { program } =>
		// _SelfExecute should be called by interpreter itself
			if env.contract.address != info.sender {
				Err(ContractError::NotAuthorized)
			} else {
				let program = proto::Program::decode(&program[..])
					.map_err(|_| ContractError::InvalidProgram)?;
				interpret_program(deps, env, info, program)
			},
		ExecuteMsg::AddOwners { owners } => add_owners(deps, owners),
		ExecuteMsg::RemoveOwners { owners } => Ok(remove_owners(deps, owners)),
	}
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(deps: DepsMut, _env: Env, _msg: MigrateMsg) -> Result<Response, ContractError> {
	// Already only callable by the admin of the contract, so no need to `assert_owner`
	let _ = ensure_from_older_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
	Ok(Response::default())
}

fn assert_owner(deps: Deps, self_addr: &Addr, owner: &Addr) -> Result<(), ContractError> {
	if owner == self_addr || OWNERS.has(deps.storage, owner.clone()) {
		Ok(())
	} else {
		Err(ContractError::NotAuthorized)
	}
}

pub fn initiate_execution(
	deps: DepsMut,
	env: Env,
	program: Vec<u8>,
) -> Result<Response, ContractError> {
	IP_REGISTER.save(deps.storage, &0)?;
	Ok(Response::default().add_submessage(SubMsg::reply_on_error(
		wasm_execute(env.contract.address, &ExecuteMsg::_SelfExecute { program }, Vec::new())?,
		SELF_CALL_ID,
	)))
}

pub fn add_owners(deps: DepsMut, owners: Vec<Addr>) -> Result<Response, ContractError> {
	let mut event = Event::new("xcvm.interpreter.add_owners");
	for owner in owners {
		event = event.add_attribute(format!("{}", owner), "");
		OWNERS.save(deps.storage, owner, &())?;
	}
	Ok(Response::default().add_event(event))
}

pub fn remove_owners(deps: DepsMut, owners: Vec<Addr>) -> Response {
	let mut event = Event::new("xcvm.interpreter.remove_owners");
	for owner in owners {
		event = event.add_attribute(format!("{}", owner), "");
		OWNERS.remove(deps.storage, owner);
	}
	Response::default().add_event(event)
}

pub fn interpret_program(
	mut deps: DepsMut,
	env: Env,
	_info: MessageInfo,
	program: proto::Program,
) -> Result<Response, ContractError> {
	let mut response = Response::new();
	let instructions = must_ok!(program.instructions)?.instructions;
	let instruction_len = instructions.len();
	let mut instruction_iter = instructions.into_iter().enumerate();
	let mut ip = IP_REGISTER.load(deps.storage)?;
	while let Some((index, instruction)) = instruction_iter.next() {
		let instruction = must_ok!(instruction.instruction)?;
		response = match instruction {
			proto::instruction::Instruction::Call(proto::Call { payload, bindings }) => {
				let bindings = must_ok!(bindings)?;
				if index >= instruction_len - 1 {
					// If the call is the final instruction, do not yield execution
					interpret_call(
						deps.as_ref(),
						&env,
						bindings.bindings,
						payload,
						ip as usize,
						response,
					)?
				} else {
					// If the call is not the final instruction:
					// 1. interpret the call: this will add the call to the response's
					//    submessages.
					// 2. yield the execution by adding a call to the interpreter with the
					//    rest of the instructions as XCVM program. This will make sure that
					//    previous call instruction will run first, then the rest of the program
					//    will run.
					let response = interpret_call(
						deps.as_ref(),
						&env,
						bindings.bindings,
						payload,
						index,
						response,
					)?;

					let program = {
						let instructions: Vec<proto::Instruction> =
							instruction_iter.map(|(_, instr)| instr).collect();
						let program = proto::Program {
							tag: program.tag.clone(),
							instructions: Some(proto::Instructions { instructions }),
						};
						let mut buf = Vec::new();
						buf.reserve(program.encoded_len());
						program.encode(&mut buf).unwrap();
						buf
					};
					return Ok(response.add_message(wasm_execute(
						env.contract.address,
						&ExecuteMsg::_SelfExecute { program },
						vec![],
					)?))
				}
			},
			proto::instruction::Instruction::Spawn(ctx) =>
				interpret_spawn(&deps, &env, ctx, response)?,
			proto::instruction::Instruction::Transfer(proto::Transfer { assets, account_type }) =>
				interpret_transfer(&mut deps, &env, must_ok!(account_type)?, assets, response)?,
			instr => return Err(ContractError::InstructionNotSupported(format!("{:?}", instr))),
		};
		ip += 1;
	}

	IP_REGISTER.save(deps.storage, &ip)?;

	Ok(response.add_event(Event::new("xcvm.interpreter.executed").add_attribute(
		"program",
		core::str::from_utf8(&program.tag).map_err(|_| ContractError::InvalidProgramTag)?,
	)))
}

/// Interpret the `Call` instruction
/// * `encoded`: JSON-encoded `LateCall` as bytes
///
/// Late-bindings are actually done in this function. If our XCVM SDK is not used,
/// make sure that indices in the `LateCall` is sorted in an ascending order.
pub fn interpret_call(
	deps: Deps,
	env: &Env,
	bindings: Vec<proto::Binding>,
	payload: Vec<u8>,
	_ip: usize,
	response: Response,
) -> Result<Response, ContractError> {
	// We don't know the type of the payload, so we use `serde_json::Value`
	let flat_cosmos_msg: FlatCosmosMsg<serde_json::Value> = if !bindings.is_empty() {
		let Config { registry_address, relayer_address, .. } = CONFIG.load(deps.storage)?;
		// Len here is the maximum possible length
		let mut formatted_call =
			vec![0; env.contract.address.as_bytes().len() * bindings.len() + payload.len()];
		// Current index of the unformatted call
		let mut original_index: usize = 0;
		// This stores the amount of shifting we caused because of the data insertion. For example,
		// inserting a contract address "addr1234" causes 8 chars of shift. Which means index 'X' in
		// the unformatted call, will be equal to 'X + 8' in the output call.
		let mut offset: usize = 0;
		for binding in bindings {
			let binding_index = binding.position as usize;
			let binding = must_ok!(must_ok!(binding.binding_value)?.r#type)?;
			// Current index of the output call
			let shifted_index = original_index + offset;

			// Check for overflow
			// * No need to check if `shifted_index` > `binding_index + offset` because
			//   `original_index > binding_index` already guarantees that
			// * No need to check if `shifted_index < formatted_call.len()` because initial
			//   allocation of `formatted_call` guarantees that even the max length can fit in.
			// * No need to check if `original_index < encoded_call.len()` because `original_index`
			//   is already less or equals to `binding_index` and we check if `binding_index` is
			//   in-bounds.
			if original_index > binding_index || binding_index + 1 >= payload.len() {
				return Err(ContractError::InvalidBindings)
			}

			// Copy everything until the index of where binding happens from original call
			// to formatted call. Eg.
			// Formatted call: `{ "hello": "" }`
			// Output call supposed to be: `{ "hello": "contract_addr" }`
			// In the first iteration, this will copy `{ "hello": "` to the formatted call.
			// SAFETY:
			//     - Two slices are in the same size for sure because `shifted_index` is
			//		 `original_index + offset` and `binding_index + offset - (shifted_index)`
			//       equals to `binding_index - original_index`.
			//     - Index accesses should not fail because we check if all indices are inbounds and
			//       also if `shifted` and `original` indices are greater than `binding_index`
			formatted_call[shifted_index..=binding_index + offset]
				.copy_from_slice(&payload[original_index..=binding_index]);

			let data: Cow<[u8]> = match binding {
				proto::binding_value::Type::Relayer(_) => Cow::Borrowed(relayer_address.as_bytes()),
				proto::binding_value::Type::Self_(_) =>
					Cow::Borrowed(env.contract.address.as_bytes()),
				proto::binding_value::Type::AssetId(proto::AssetId { asset_id }) => {
					let asset_id = must_ok!(asset_id)?;
					let query_msg = AssetRegistryQueryMsg::GetAssetContract(asset_id.into());

					let response: GetAssetContractResponse = deps.querier.query(
						&WasmQuery::Smart {
							contract_addr: registry_address.clone().into_string(),
							msg: to_binary(&query_msg)?,
						}
						.into(),
					)?;

					Cow::Owned(response.addr.into_string().into())
				},
				proto::binding_value::Type::Result(_) => Cow::Owned(
					serde_json_wasm::to_vec(&RESULT_REGISTER.load(deps.storage)?)
						.map_err(|_| ContractError::DataSerializationError)?,
				),
				proto::binding_value::Type::Ip(_) =>
					Cow::Owned(format!("{}", IP_REGISTER.load(deps.storage)?).into()),
				_ => return Err(ContractError::InvalidBindings),
			};

			formatted_call[binding_index + offset + 1..=binding_index + offset + data.len()]
				.copy_from_slice(&data);
			offset += data.len();
			original_index = binding_index + 1;
		}
		// Copy the rest of the data to the output data
		if original_index < payload.len() {
			formatted_call[original_index + offset..payload.len() + offset]
				.copy_from_slice(&payload[original_index..]);
		}
		// Get rid of the final 0's.
		formatted_call.truncate(payload.len() + offset);
		serde_json_wasm::from_slice(&formatted_call)
			.map_err(|_| ContractError::InvalidCallPayload)?
	} else {
		// We don't have any binding, just deserialize the data
		serde_json_wasm::from_slice(&payload).map_err(|_| ContractError::InvalidCallPayload)?
	};

	let cosmos_msg: CosmosMsg =
		flat_cosmos_msg.try_into().map_err(|_| ContractError::DataSerializationError)?;
	Ok(response.add_submessage(SubMsg::reply_on_success(cosmos_msg, CALL_ID)))
}

pub fn interpret_spawn(
	deps: &DepsMut,
	env: &Env,
	mut ctx: proto::Spawn,
	mut response: Response,
) -> Result<Response, ContractError> {
	#[derive(Serialize)]
	struct SpawnEvent {
		network: u32,
		salt: Vec<u8>,
		security: i32,
		assets: Funds<Displayed<u128>>,
		program: Vec<u8>,
	}

	let config = CONFIG.load(deps.storage)?;
	let registry_addr = config.registry_address.into_string();
	let mut normalized_funds: Vec<proto::Asset> = Vec::new();

	for asset in ctx.assets {
		let asset_id = must_ok!(must_ok!(asset.asset_id)?.asset_id)?;
		let amount: Amount = must_ok!(asset.balance)?.try_into()?;
		if amount.is_zero() {
			// We ignore zero amounts
			continue
		}

		let amount = if amount.slope.0 == 0 {
			// No need to get balance from cw20 contract
			Amount::absolute(amount.intercept.0)
		} else {
			let query_msg = AssetRegistryQueryMsg::GetAssetContract(asset_id.clone().into());

			let cw20_address: GetAssetContractResponse = deps.querier.query(
				&WasmQuery::Smart {
					contract_addr: registry_addr.clone(),
					msg: to_binary(&query_msg)?,
				}
				.into(),
			)?;
			let response =
				deps.querier.query::<BalanceResponse>(&QueryRequest::Wasm(WasmQuery::Smart {
					contract_addr: cw20_address.addr.clone().into_string(),
					msg: to_binary(&Cw20QueryMsg::Balance {
						address: env.contract.address.clone().into_string(),
					})?,
				}))?;
			Amount::absolute(amount.apply(response.balance.into()).into())
		};

		if !amount.is_zero() {
			let asset_id: u128 = asset_id.into();
			let burn_amount = amount.intercept.0;
			normalized_funds.push((AssetId(asset_id), amount).into());
			// TODO(probably call the router via a Cw20 `send` to spawn the program and do w/e
			// required with the funds)
			let query_msg = AssetRegistryQueryMsg::GetAssetContract(asset_id);
			let cw20_address: GetAssetContractResponse = deps.querier.query(
				&WasmQuery::Smart {
					contract_addr: registry_addr.clone(),
					msg: to_binary(&query_msg)?,
				}
				.into(),
			)?;
			let contract = Cw20Contract(cw20_address.addr);
			response = response
				.add_message(contract.call(Cw20ExecuteMsg::Burn { amount: burn_amount.into() })?);
		}
	}

	let encoded_spawn = {
		ctx.assets = normalized_funds.into();
		let mut buf = Vec::new();
		buf.reserve(ctx.encoded_len());
		ctx.encode(&mut buf).map_err(|_| ContractError::DataSerializationError)?;
		buf
	};

	Ok(response.add_event(
		Event::new("xcvm.interpreter.spawn")
			.add_attribute(
				"origin_network_id",
				serde_json_wasm::to_string(&config.network_id.0)
					.map_err(|_| ContractError::DataSerializationError)?,
			)
			.add_attribute(
				"origin_user_id",
				serde_json_wasm::to_string(&config.user_id)
					.map_err(|_| ContractError::DataSerializationError)?,
			)
			.add_attribute("program", Binary(encoded_spawn).to_base64()),
	))
}

pub fn interpret_transfer(
	deps: &mut DepsMut,
	env: &Env,
	to: proto::transfer::AccountType,
	assets: Vec<proto::Asset>,
	mut response: Response,
) -> Result<Response, ContractError> {
	let config = CONFIG.load(deps.storage)?;
	let registry_addr = config.registry_address.into_string();

	let recipient = match to {
		proto::transfer::AccountType::Account(proto::Account { account }) =>
			String::from_utf8(account).map_err(|_| ContractError::InvalidAddress)?,
		proto::transfer::AccountType::Relayer(_) => config.relayer_address.into_string(),
	};

	for asset in assets {
		let asset_id = must_ok!(must_ok!(asset.asset_id)?.asset_id)?;
		let amount: Amount = must_ok!(asset.balance)?.try_into()?;

		let query_msg = AssetRegistryQueryMsg::GetAssetContract(asset_id.into());

		let cw20_address: GetAssetContractResponse = deps.querier.query(
			&WasmQuery::Smart { contract_addr: registry_addr.clone(), msg: to_binary(&query_msg)? }
				.into(),
		)?;
		let contract = Cw20Contract(cw20_address.addr.clone());

		if amount.is_zero() {
			continue
		}

		let transfer_amount = {
			let response =
				deps.querier.query::<BalanceResponse>(&QueryRequest::Wasm(WasmQuery::Smart {
					contract_addr: cw20_address.addr.clone().into_string(),
					msg: to_binary(&Cw20QueryMsg::Balance {
						address: env.contract.address.clone().into_string(),
					})?,
				}))?;
			amount.apply(response.balance.into())
		};

		response = response.add_message(contract.call(Cw20ExecuteMsg::Transfer {
			recipient: recipient.clone(),
			amount: transfer_amount.into(),
		})?);
	}

	Ok(response)
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
	match msg {
		QueryMsg::Register(Register::Ip) => Ok(to_binary(&IP_REGISTER.load(deps.storage)?)?),
		QueryMsg::Register(Register::Result) =>
			Ok(to_binary(&RESULT_REGISTER.load(deps.storage)?)?),
		QueryMsg::Register(Register::This) => Ok(to_binary(&env.contract.address)?),
		QueryMsg::Register(Register::Relayer) => {
			let Config { user_id, .. } = CONFIG.load(deps.storage)?;
			Ok(to_binary(&user_id)?)
		},
	}
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn reply(deps: DepsMut, _env: Env, msg: Reply) -> StdResult<Response> {
	match msg.id {
		CALL_ID => handle_call_result(deps, msg),
		SELF_CALL_ID => handle_self_call_result(deps, msg),
		id => Err(StdError::generic_err(format!("Unknown reply id: {}", id))),
	}
}

fn handle_self_call_result(deps: DepsMut, msg: Reply) -> StdResult<Response> {
	match msg.result.into_result() {
		Ok(_) => Err(StdError::generic_err("Returned OK from a reply that is called with `reply_on_error`. This should never happen")),
		Err(e) => {
			// Save the result that is returned from the sub-interpreter
			// this way, only the `RESULT_REGISTER` is persisted. All 
			// other state changes are reverted.
			RESULT_REGISTER.save(deps.storage, &Err(e))?;
			Ok(Response::default())
		}
	}
}

fn handle_call_result(deps: DepsMut, msg: Reply) -> StdResult<Response> {
	let response = msg.result.into_result().map_err(StdError::generic_err)?;
	RESULT_REGISTER.save(deps.storage, &Ok(response.clone()))?;
	Ok(Response::default().add_events(response.events))
}

#[cfg(test)]
mod tests {
	use super::*;
	use cosmwasm_std::{
		testing::{mock_dependencies, mock_env, mock_info, MockQuerier, MOCK_CONTRACT_ADDR},
		Addr, CanonicalAddr, ContractResult, QuerierResult, SystemResult, WasmMsg,
	};
	use serde::Deserialize;
	use xcvm_core::{
		Amount, AssetId, BindingValue, BridgeSecurity, Destination, Picasso, ETH, PICA,
	};

	type XCVMProgram = proto::XCVMProgram<CanonicalAddr>;
	type XCVMInstruction = proto::XCVMInstruction<CanonicalAddr>;

	const CW20_ADDR: &str = "cw20_addr";
	const REGISTRY_ADDR: &str = "registry_addr";
	const RELAYER_ADDR: &str = "relayer_addr";

	#[test]
	fn proper_instantiation() {
		let mut deps = mock_dependencies();

		let msg = InstantiateMsg {
			registry_address: REGISTRY_ADDR.to_string(),
			relayer_address: RELAYER_ADDR.to_string(),
			network_id: Picasso.into(),
			user_id: vec![],
		};
		let info = mock_info("sender", &vec![]);

		let res = instantiate(deps.as_mut(), mock_env(), info, msg).unwrap();
		assert_eq!(0, res.messages.len());

		// Make sure that the storage is empty
		assert_eq!(
			CONFIG.load(&deps.storage).unwrap(),
			Config {
				registry_address: Addr::unchecked(REGISTRY_ADDR),
				relayer_address: Addr::unchecked(RELAYER_ADDR),
				network_id: Picasso.into(),
				user_id: vec![]
			}
		);
	}

	fn encode_protobuf(program: proto::Program) -> Vec<u8> {
		let mut buf = Vec::new();
		buf.reserve(program.encoded_len());
		program.encode(&mut buf).unwrap();
		buf
	}

	fn encode_spawn(spawn: proto::Spawn) -> Vec<u8> {
		let mut buf = Vec::new();
		buf.reserve(spawn.encoded_len());
		spawn.encode(&mut buf).unwrap();
		buf
	}

	fn wasm_querier(query: &WasmQuery) -> QuerierResult {
		match query {
			WasmQuery::Smart { contract_addr, .. } if contract_addr.as_str() == CW20_ADDR =>
				SystemResult::Ok(ContractResult::Ok(
					to_binary(&cw20::BalanceResponse { balance: 100000_u128.into() }).unwrap(),
				)),
			WasmQuery::Smart { contract_addr, .. } if contract_addr.as_str() == REGISTRY_ADDR =>
				SystemResult::Ok(ContractResult::Ok(
					to_binary(&cw_xcvm_asset_registry::msg::GetAssetContractResponse {
						addr: Addr::unchecked(CW20_ADDR),
					})
					.unwrap(),
				))
				.into(),
			_ => panic!("Unhandled query"),
		}
	}

	#[test]
	fn execute_transfer() {
		let mut deps = mock_dependencies();
		let mut querier = MockQuerier::default();
		querier.update_wasm(wasm_querier);
		deps.querier = querier;

		let info = mock_info(MOCK_CONTRACT_ADDR, &vec![]);
		let _ = instantiate(
			deps.as_mut(),
			mock_env(),
			info.clone(),
			InstantiateMsg {
				registry_address: REGISTRY_ADDR.into(),
				relayer_address: RELAYER_ADDR.into(),
				network_id: Picasso.into(),
				user_id: vec![],
			},
		)
		.unwrap();

		IP_REGISTER.save(deps.as_mut().storage, &0).unwrap();

		let program = XCVMProgram {
			tag: vec![],
			instructions: vec![XCVMInstruction::Transfer {
				to: Destination::Relayer,
				assets: Funds::from([
					(Into::<AssetId>::into(PICA), Amount::absolute(1)),
					(ETH.into(), Amount::absolute(2)),
				]),
			}]
			.into(),
		}
		.into();

		let program = encode_protobuf(program);
		let res =
			execute(deps.as_mut(), mock_env(), info.clone(), ExecuteMsg::_SelfExecute { program })
				.unwrap();
		let contract = Cw20Contract(Addr::unchecked(CW20_ADDR));
		let messages = vec![
			contract
				.call(Cw20ExecuteMsg::Transfer {
					recipient: RELAYER_ADDR.into(),
					amount: 1_u128.into(),
				})
				.unwrap(),
			contract
				.call(Cw20ExecuteMsg::Transfer {
					recipient: RELAYER_ADDR.into(),
					amount: 2_u128.into(),
				})
				.unwrap(),
		];

		assert_eq!(res.messages.into_iter().map(|msg| msg.msg).collect::<Vec<_>>(), messages);
	}

	#[test]
	fn execute_call() {
		let mut deps = mock_dependencies();

		let info = mock_info(MOCK_CONTRACT_ADDR, &vec![]);
		let _ = instantiate(
			deps.as_mut(),
			mock_env(),
			info.clone(),
			InstantiateMsg {
				registry_address: REGISTRY_ADDR.into(),
				relayer_address: RELAYER_ADDR.into(),
				network_id: Picasso.into(),
				user_id: vec![],
			},
		)
		.unwrap();

		IP_REGISTER.save(deps.as_mut().storage, &0).unwrap();

		let late_call = LateCall::wasm_execute(
			StaticBinding::None(String::from("1234")),
			IndexedBinding::None(&"hello world".to_string()),
			vec![],
		)
		.unwrap();

		let instructions = vec![
			XCVMInstruction::Call {
				bindings: late_call.bindings.clone(),
				encoded: late_call.encoded_call.clone(),
			},
			XCVMInstruction::Transfer { to: Destination::Relayer, assets: Funds::empty() },
			XCVMInstruction::Call {
				bindings: late_call.bindings.clone(),
				encoded: late_call.encoded_call.clone(),
			},
			XCVMInstruction::Spawn {
				network: Picasso.into(),
				salt: vec![],
				bridge_security: BridgeSecurity::Deterministic,
				assets: Funds::empty(),
				program: XCVMProgram { tag: vec![], instructions: vec![].into() },
			},
		];

		let program = XCVMProgram { tag: vec![], instructions: instructions.clone().into() };
		let execute_msg = ExecuteMsg::_SelfExecute {
			program: encode_protobuf(
				XCVMProgram { tag: vec![], instructions: instructions[1..].to_owned().into() }
					.into(),
			),
		};

		let res = execute(
			deps.as_mut(),
			mock_env(),
			info.clone(),
			ExecuteMsg::_SelfExecute { program: encode_protobuf(program.into()) },
		)
		.unwrap();
		assert_eq!(
			res.messages[0].msg,
			CosmosMsg::Wasm(WasmMsg::Execute {
				contract_addr: "1234".into(),
				msg: to_binary(&"hello world").unwrap(),
				funds: Vec::new(),
			})
		);
		assert_eq!(
			res.messages[1].msg,
			CosmosMsg::Wasm(WasmMsg::Execute {
				contract_addr: MOCK_CONTRACT_ADDR.into(),
				msg: to_binary(&execute_msg).unwrap(),
				funds: Vec::new(),
			})
		);
		assert_eq!(res.messages.len(), 2);
	}

	#[test]
	fn execute_spawn() {
		let mut deps = mock_dependencies();

		let info = mock_info(MOCK_CONTRACT_ADDR, &vec![]);
		let _ = instantiate(
			deps.as_mut(),
			mock_env(),
			info.clone(),
			InstantiateMsg {
				registry_address: REGISTRY_ADDR.into(),
				relayer_address: RELAYER_ADDR.into(),
				network_id: Picasso.into(),
				user_id: vec![],
			},
		)
		.unwrap();

		IP_REGISTER.save(deps.as_mut().storage, &0).unwrap();

		let inner_program = XCVMProgram {
			tag: vec![],
			instructions: vec![XCVMInstruction::Call { bindings: vec![], encoded: vec![] }].into(),
		};

		let spawn = XCVMInstruction::Spawn {
			network: Picasso.into(),
			salt: vec![],
			bridge_security: BridgeSecurity::Deterministic,
			assets: Funds::empty(),
			program: inner_program.clone(),
		};

		let program = XCVMProgram { tag: vec![], instructions: vec![spawn.clone()].into() }.into();
		let program = encode_protobuf(program);
		let res =
			execute(deps.as_mut(), mock_env(), info.clone(), ExecuteMsg::_SelfExecute { program })
				.unwrap();
		let spawn = proto::Spawn {
			network: Some(Into::<xcvm_core::NetworkId>::into(Picasso).into()),
			salt: Some(xcvm_proto::Salt { salt: vec![] }),
			security: 1,
			program: Some(inner_program.into()),
			assets: Vec::new(),
		};

		assert_eq!(
			res.events[0],
			Event::new("xcvm.interpreter.spawn")
				.add_attribute("origin_network_id", "1")
				.add_attribute("origin_user_id", "[]")
				.add_attribute("program", Binary(encode_spawn(spawn)).to_base64())
		);
	}

	#[test]
	fn late_bindings() {
		let mut deps = mock_dependencies();

		let info = mock_info(MOCK_CONTRACT_ADDR, &vec![]);
		let _ = instantiate(
			deps.as_mut(),
			mock_env(),
			info.clone(),
			InstantiateMsg {
				registry_address: REGISTRY_ADDR.into(),
				relayer_address: RELAYER_ADDR.into(),
				network_id: Picasso.into(),
				user_id: vec![65, 65],
			},
		)
		.unwrap();

		IP_REGISTER.save(deps.as_mut().storage, &0).unwrap();

		#[derive(Debug, Clone, Serialize, Deserialize, Default)]
		struct TestMsg {
			part1: String,
			part2: String,
			part3: String,
		}

		let late_call = LateCall::wasm_execute(
			StaticBinding::Some(BindingValue::Register(Register::This)),
			IndexedBinding::Some((
				[
					(9, BindingValue::Register(Register::This)),
					(36, BindingValue::Register(Register::Relayer)),
				]
				.into(),
				TestMsg {
					part1: String::new(),
					part2: String::from("hello"),
					part3: String::new(),
				},
			)),
			Vec::new(),
		)
		.unwrap();

		let instructions = vec![XCVMInstruction::Call {
			bindings: late_call.bindings.clone(),
			encoded: late_call.encoded_call.clone(),
		}];
		let program = XCVMProgram { tag: vec![], instructions: instructions.clone().into() };
		let res = execute(
			deps.as_mut(),
			mock_env(),
			info.clone(),
			ExecuteMsg::_SelfExecute { program: encode_protobuf(program.into()) },
		)
		.unwrap();
		let final_test_msg = TestMsg {
			part1: MOCK_CONTRACT_ADDR.into(),
			part2: "hello".into(),
			part3: RELAYER_ADDR.into(),
		};
		assert_eq!(
			CosmosMsg::Wasm(WasmMsg::Execute {
				contract_addr: MOCK_CONTRACT_ADDR.into(),
				msg: cosmwasm_std::Binary(serde_json::to_vec(&final_test_msg).unwrap()),
				funds: Vec::new()
			}),
			res.messages[0].msg
		);
	}
}
