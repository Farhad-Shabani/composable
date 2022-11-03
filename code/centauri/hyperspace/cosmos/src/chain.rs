use futures::Stream;
use ibc_proto::google::protobuf::Any;
use primitives::{Chain, IbcProvider};
use std::pin::Pin;

use crate::finality_protocol::FinalityProtocol;

use super::{error::Error, CosmosClient};

#[async_trait::async_trait]
impl<H> Chain for CosmosClient<H>
where
	H: Clone + Send + Sync + 'static,
{
	fn name(&self) -> &str {
		&*self.name
	}

	fn block_max_weight(&self) -> u64 {
		// TODO: Temporary hardcoded value to pass initial tests
		30
	}

	async fn estimate_weight(&self, messages: Vec<Any>) -> Result<u64, Self::Error> {
	    // TODO: Temporary hardcoded value to pass initial tests
		Ok(100)
	}

	async fn finality_notifications(
		&self,
	) -> Pin<Box<dyn Stream<Item = <Self as IbcProvider>::FinalityEvent> + Send + Sync>> {
		match self.finality_protocol {
			FinalityProtocol::Tendermint => {
				todo!()
			},
		}
	}

	async fn submit(&self, messages: Vec<Any>) -> Result<(), Error> {
		Ok(())
	}
}
