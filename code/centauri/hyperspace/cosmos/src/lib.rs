#![allow(clippy::all)]

pub mod chain;
pub mod error;
pub mod finality_protocol;
pub mod key_provider;
pub mod provider;
#[cfg(any(test, feature = "testing"))]
pub mod test_provider;
use core::time::Duration;
use error::Error;
use ibc::{
	core::{
		ics02_client::{height::Height, trust_threshold::TrustThreshold},
		ics23_commitment::{commitment::CommitmentPrefix, specs::ProofSpecs},
		ics24_host::{
			identifier::{ChainId, ClientId},
			path::ClientConsensusStatePath,
			Path,
		},
	},
	protobuf::Protobuf,
};
use ibc_proto::{
	cosmos::base::query::v1beta1::PageRequest,
	google::protobuf::Any,
	ibc::core::{
		client::v1::{
			IdentifiedClientState, QueryConsensusStateRequest, QueryConsensusStateResponse,
		},
		connection::v1::{IdentifiedConnection, QueryConnectionResponse},
	},
};
use ics07_tendermint::{
	client_state::ClientState as TmClientState, consensus_state::ConsensusState as TmConsensusState,
};
use pallet_ibc::{
	light_clients::{AnyClientState, AnyConsensusState, HostFunctionsManager},
	MultiAddress, Timeout, TransferParams,
};
use primitives::{IbcProvider, KeyProvider};
use serde::Deserialize;
use std::str::FromStr;
use tendermint::block::Height as TmHeight;
use tendermint_rpc::{abci::Path as TendermintABCIPath, Client, HttpClient, Url, WebSocketClient};
// Implements the [`crate::Chain`] trait for cosmos.
/// This is responsible for:
/// 1. Tracking a cosmos light client on a counter-party chain, advancing this light
/// client state  as new finality proofs are observed.
/// 2. Submiting new IBC messages to this cosmos.
#[derive(Clone)]
pub struct CosmosClient<H> {
	/// Chain name
	pub name: String,
	/// Chain rpc client
	pub rpc_client: HttpClient,
	/// Chain grpc address
	pub grpc_url: Url,
	/// Websocket chain ws client
	pub ws_client: WebSocketClient,
	/// Chain Id
	pub chain_id: String,
	/// Light client id on counterparty chain
	pub client_id: Option<ClientId>,
	/// Name of the key to use for signing
	pub key_name: String,
	/// Account prefix
	pub account_prefix: String,
	/// Reference to commitment
	pub commitment_prefix: CommitmentPrefix,
	/// Reference to proof specs
	pub finality_protocol: finality_protocol::FinalityProtocol,
	pub _phantom: std::marker::PhantomData<H>,
}
/// config options for [`ParachainClient`]
#[derive(Debug, Deserialize)]
pub struct CosmosClientConfig {
	/// Chain name
	pub name: String,
	/// Cosmos chain Id
	pub chain_id: String,
	/// rpc url for cosmos
	pub rpc_url: Url,
	/// grpc url for cosmos
	pub grpc_url: Url,
	/// websocket url for cosmos
	pub websocket_url: Url,
	/// Light client id on counterparty chain
	pub client_id: Option<String>,
	/// Account prefix
	pub account_prefix: String,
	/// Store prefix
	pub store_prefix: String,
	/// Name of the key that signs transactions
	pub key_name: String,
}

impl<H> CosmosClient<H>
where
	Self: KeyProvider,
	H: Clone + Send + Sync + 'static,
{
	/// Initializes a [`CosmosClient`] given a [`CosmosClientConfig`]
	pub async fn new(config: CosmosClientConfig) -> Result<Self, Error> {
		let rpc_client = HttpClient::new(config.rpc_url.clone())
			.map_err(|e| Error::RpcError(format!("{:?}", e)))?;
		let (ws_client, _ws_driver) = WebSocketClient::new(config.websocket_url.clone())
			.await
			.map_err(|e| Error::from(format!("Web Socket Client Error {:?}", e)))?;

		let client_id = Some(
			ClientId::new(config.client_id.unwrap().as_str(), 0)
				.map_err(|e| Error::from(format!("Invalid client id {}", e)))?,
		);

		let commitment_prefix = CommitmentPrefix::try_from(config.store_prefix.as_bytes().to_vec())
			.map_err(|e| Error::from(format!("Invalid store prefix {}", e)))?;

		Ok(Self {
			name: config.name,
			chain_id: config.chain_id,
			rpc_client,
			grpc_url: config.grpc_url,
			ws_client,
			client_id,
			account_prefix: config.account_prefix,
			commitment_prefix,
			key_name: config.key_name,
			finality_protocol: finality_protocol::FinalityProtocol::Tendermint,
			_phantom: std::marker::PhantomData,
		})
	}

	pub fn client_id(&self) -> ClientId {
		self.client_id.as_ref().unwrap().clone()
	}

	pub fn set_client_id(&mut self, client_id: ClientId) {
		self.client_id = Some(client_id)
	}

	/// Construct a tendermint client state to be submitted to the counterparty chain
	pub async fn construct_tendermint_client_state(
		&self,
	) -> Result<(AnyClientState, AnyConsensusState), Error>
	where
		Self: KeyProvider + IbcProvider,
		H: Clone + Send + Sync + 'static,
	{
		todo!()
	}

	pub async fn submit_create_client_msg(&self, msg: String) -> Result<ClientId, Error> {
		todo!()
	}

	pub async fn transfer_tokens(&self, asset_id: u128, amount: u128) -> Result<(), Error> {
		Ok(())
	}

	pub async fn submit_sudo_call(&self) -> Result<(), Error> {
		Ok(())
	}
}
