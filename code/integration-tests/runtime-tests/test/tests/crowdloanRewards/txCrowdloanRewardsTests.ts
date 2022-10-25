import { expect } from "chai";
import { KeyringPair } from "@polkadot/keyring/types";
import testConfiguration from "./test_configuration.json";
import {
  getSumOfContributorRewardsAmount,
  TxCrowdloanRewardsTests
} from "@composabletests/tests/crowdloanRewards/testHandlers/crowdloanHandler";
import { mintAssetsToWallet } from "@composable/utils/mintingHelper";
import { ApiPromise } from "@polkadot/api";
import { getNewConnection } from "@composable/utils/connectionHelper";
import { getDevWallets } from "@composable/utils/walletHelper";

const AMOUNT_CONTRIBUTOR_WALLETS = 8;

describe("CrowdloanRewards Tests", function () {
  if (!testConfiguration.enabledTests.tx.enabled) return;

  let api: ApiPromise;

  let sudoKey: KeyringPair;

  let contributors: KeyringPair[];

  before("Setting up tests", async function () {
    this.timeout(2 * 60 * 1000);
    const { newClient, newKeyring } = await getNewConnection();
    api = newClient;
    const { devWalletAlice } = getDevWallets(newKeyring);
    sudoKey = devWalletAlice;

    contributors = [];
    for (let i = 0; i <= AMOUNT_CONTRIBUTOR_WALLETS; i++) {
      contributors.push(devWalletAlice.derive("/test/crowdloan/contributor" + i));
    }

    // Funding the PICA Holder which will fund the pallet.
    await mintAssetsToWallet(api, sudoKey, sudoKey, [1], getSumOfContributorRewardsAmount());
    // Funding the wallets with small initial balance.
    await mintAssetsToWallet(api, contributors[1], sudoKey, [1], 1_000_000_000_000n); // Test #1.7
    await mintAssetsToWallet(api, contributors[3], sudoKey, [1], 1_000_000_000_000n); // Test #1.9
  });

  after("Closing the connection", async function () {
    await api.disconnect();
  });

  it.only("1.1  I can, as sudo, populate the Crowdloan pallet with the list of contributors.", async function () {
    // 5 minutes timeout
    this.timeout(10 * 60 * 1000);
    const sumRewardsToBeDistributed = await TxCrowdloanRewardsTests.txCrowdloanRewardsPopulateTest(
      api,
      sudoKey,
      contributors
    );
    console.debug(sumRewardsToBeDistributed);
  });

  /*
  The following steps occur after the pallet has been populated with contributors.
   */

  it("1.2  I can not associate my KSM contributor wallet before the crowdloan pallet has been initialized.");

  it("1.3  I can, as sudo, initialize the Crowdloan Pallet", async function () {
    // 2 minutes timeout
    this.timeout(60 * 2 * 1000);
    const {
      data: [result]
    } = await TxCrowdloanRewardsTests.txCrowdloanRewardsInitializeTest(api, sudoKey);
    expect(result.isOk).to.be.true;
  });

  /*
  The following steps occur after the pallet was populated & initialised.
   */
  it(
    "1.4  A user, without initial funds, can associate their contributor KSM wallet with a correct proof & claim 25% of the reward as locked balance."
  );

  it("1.5  A user (#1.6) can not transfer their claimed funds.");

  it("1.6  A user (#1.6) can claim a second time and pays transaction fees using the claimed, locked balance from earlier.", async function () {
    // 2 minutes timeout
    this.timeout(60 * 2 * 1000);
    // const {
    //   data: [resultRemoteAccountId, resultAccountId, resultClaimedAmount]
    // } = await TxCrowdloanRewardsTests.txCrowdloanRewardsClaimTest(api, contributorRewardAccount);
    // expect(resultRemoteAccountId).to.not.be.an("Error");
    // expect(resultClaimedAmount).to.be.a.bignumber;
    // expect(resultClaimedAmount.toNumber()).to.be.greaterThan(0);
    // expect(resultAccountId.toString()).to.be.equal(
    //   api.createType("AccountId32", contributorRewardAccount.publicKey).toString()
    // );
  });

  it(
    "1.7  A user, with initial funds, can associate their contributor KSM wallet with a correct proof & claim 25% of the reward as locked balance."
  );

  it(
    "1.8  A user, without initial funds, can associate their contributor ETH wallet with a correct proof & claim 25% of the reward as locked balance."
  );

  it(
    "1.9  Another user, with initial funds, can associate their contributor ETH wallet with a correct proof & claim 25% of the reward as locked balance."
  );

  it("1.10  When claiming after transferring all initial funds from the account (#1.11), the newly claimed balance will be locked.", async function () {
    // 2 minutes timeout
    this.timeout(60 * 2 * 1000);
    // const {
    //   data: [resultRemoteAccountId, resultAccountId, resultClaimedAmount]
    // } = await TxCrowdloanRewardsTests.txCrowdloanRewardsClaimTest(api, contributorEthRewardAccount);
    // expect(resultRemoteAccountId).to.not.be.an("Error");
    // expect(resultClaimedAmount).to.be.a.bignumber;
    // expect(resultAccountId.toString()).to.be.equal(
    //   api.createType("AccountId32", contributorEthRewardAccount.publicKey).toString()
    // );
  });

  it("1.11  Multiple users can associate successfully, at the same time.");

  it("1.12  Multiple contributors (#1.12) can claim at the same time.");

  it("1.13  A user can not claim twice within the same block.");

  it("1.14  An already associated wallet can not associate again with a different reward type account.");

  it("1.15  An already associated wallet can not associate the same reward account type a second time.");

  it("1.16  Someone can re- associate their contributor wallet to a different Picasso wallet.");

  it("1.17  Someone can not use re- associations to quickly reap 25% of rewards multiple times.");

  it("1.18  A user can not claim without associating first.");

  it("1.19  A user can not associate with a wallet which isn't a contributor.");
});
