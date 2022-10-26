import { expect } from "chai";
import { KeyringPair } from "@polkadot/keyring/types";
import testConfiguration from "./test_configuration.json";
import {
  getKsmContributorWallet,
  getKsmProofMessage,
  TxCrowdloanRewardsTests
} from "@composabletests/tests/crowdloanRewards/testHandlers/crowdloanHandler";
import { ApiPromise } from "@polkadot/api";
import { getNewConnection } from "@composable/utils/connectionHelper";
import { getDevWallets } from "@composable/utils/walletHelper";
import { sendAndWaitForSuccess, sendUnsignedAndWaitForSuccess } from "@composable/utils/polkadotjs";
import BN from "bn.js";

const AMOUNT_CONTRIBUTOR_WALLETS = 8;

describe("CrowdloanRewards Tests", function () {
  if (!testConfiguration.enabledTests.tx.enabled) return;

  let api: ApiPromise;

  let sudoKey: KeyringPair;

  let contributorsRewardAmount: BN;

  let contributorRewardWallets: KeyringPair[];

  before("Setting up tests", async function () {
    this.timeout(2 * 60 * 1000);
    const { newClient, newKeyring } = await getNewConnection();
    api = newClient;
    const { devWalletAlice } = getDevWallets(newKeyring);
    sudoKey = devWalletAlice;

    contributorRewardWallets = [];
    for (let i = 0; i <= AMOUNT_CONTRIBUTOR_WALLETS; i++) {
      contributorRewardWallets.push(devWalletAlice.derive("/test/crowdloan/contributor" + i));
    }

    // Funding the PICA Holder which will fund the pallet.
    // await mintAssetsToWallet(api, sudoKey, sudoKey, [1], getSumOfContributorRewardsAmount());
    // // Funding the wallets with small initial balance.
    // await mintAssetsToWallet(api, contributorRewardWallets[1], sudoKey, [1], 1_000_000_000_000n); // Test #1.7
    // await mintAssetsToWallet(api, contributorRewardWallets[3], sudoKey, [1], 1_000_000_000_000n); // Test #1.9
  });

  after("Closing the connection", async function () {
    await api.disconnect();
  });

  it.only("1.1  I can, as sudo, populate the Crowdloan pallet with the list of contributorRewardWallets.", async function () {
    // 5 minutes timeout
    this.timeout(10 * 60 * 1000);
    this.retries(0);

    const { fullRewardAmount, allContributors } = await TxCrowdloanRewardsTests.txCrowdloanRewardsPopulateTest(
      api,
      sudoKey,
      contributorRewardWallets
    );
    contributorsRewardAmount = fullRewardAmount;
    await TxCrowdloanRewardsTests.verifyCrowdloanRewardsPopulation(api, allContributors);
  });

  /*
  The following steps occur after the pallet has been populated with contributorRewardWallets.
   */

  it.only("1.2  I can not associate my KSM contributor wallet before the crowdloan pallet has been initialized.", async function () {
    this.timeout(2 * 60 * 1000);
    this.retries(0);
    // Wallet: Contributor 1
    // Contributor Wallet: KSM Contrib 1
    const rewardAccount = contributorRewardWallets[0];
    const proofMessage = getKsmProofMessage(api, getKsmContributorWallet(rewardAccount), rewardAccount);
    await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(rewardAccount.publicKey, proofMessage)
    ).catch(function (err) {
      expect(err.toString()).to.contain("Custom error: 3");
    });
  });

  it.only("1.3  I can, as sudo, initialize the Crowdloan Pallet", async function () {
    // 2 minutes timeout
    this.timeout(60 * 2 * 1000);

    // ToDo: Provide funds!
    const requiredPalletFunds = contributorsRewardAmount;
    await TxCrowdloanRewardsTests.mintAndTransferFundsToCrowdloanPallet(api, sudoKey, requiredPalletFunds);

    const {
      data: [result]
    } = await TxCrowdloanRewardsTests.txCrowdloanRewardsInitializeTest(api, sudoKey);
    expect(result.isOk).to.be.true;

    // ToDo: Consider querying start.
  });

  it.only("1.17  I can not, as sudo, initialize the crowdloan pallet without providing at least as many funds as will be rewarded.", async function () {
    this.timeout(2 * 60 * 1000);
    this.retries(0);
    // First testing initialization without any funds.
    const {
      data: [sudoResult]
    } = await sendAndWaitForSuccess(
      api,
      sudoKey,
      api.events.sudo.Sudid.is,
      api.tx.sudo.sudo(api.tx.crowdloanRewards.initialize())
    );
    expect(sudoResult.isErr).to.be.true;
    expect(sudoResult.asErr.asModule.index).to.be.bignumber.equal(new BN("58"));
    expect(sudoResult.asErr.asModule.error.toHex()).to.be.equal("0x03000000"); // Error index 3 == RewardsNotFunded

    // Second testing initialization with too little funds.
    await TxCrowdloanRewardsTests.mintAndTransferFundsToCrowdloanPallet(api, sudoKey, Math.pow(10, 12)); // Sending 1 PICA which is not enough.
    const {
      data: [sudoResult2]
    } = await sendAndWaitForSuccess(
      api,
      sudoKey,
      api.events.sudo.Sudid.is,
      api.tx.sudo.sudo(api.tx.crowdloanRewards.initialize())
    );
    expect(sudoResult2.isErr).to.be.true;
    expect(sudoResult2.asErr.asModule.index).to.be.bignumber.equal(new BN("58"));
    expect(sudoResult2.asErr.asModule.error.toHex()).to.be.equal("0x03000000"); // Error index 3 == RewardsNotFunded
  });

  /*
  The following steps occur after the pallet was populated & initialised.
   */
  it.only("1.4  A user, without initial funds, can associate their contributor KSM wallet with a correct proof & claim 25% of the reward as locked balance.", async function () {
    this.timeout(2 * 60 * 1000);
    this.retries(0);
    // Wallet: Contributor 1
    // Contributor Wallet: KSM Contributor 1
    const rewardAccount = contributorRewardWallets[0];
    const proofMessage = getKsmProofMessage(api, getKsmContributorWallet(rewardAccount), rewardAccount);
    const {
      data: [resultRemoteAccount, resultRewardAccount]
    } = await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(rewardAccount.publicKey, proofMessage)
    );

    // Verification
    await TxCrowdloanRewardsTests.verifyKsmAssociation(api, resultRemoteAccount, resultRewardAccount, rewardAccount);
  });

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

  it("1.12  Multiple contributorRewardWallets (#1.12) can claim at the same time.");

  it("1.13  A user can not claim twice within the same block.");

  it("1.14  An already associated wallet can not associate again with a different reward type account.");

  it("1.15  An already associated wallet can not associate the same reward account type a second time.");

  it("1.16  Someone can re- associate their contributor wallet to a different Picasso wallet.");

  it("1.17  Someone can not use re- associations to quickly reap 25% of rewards multiple times.");

  it("1.18  A user can not claim without associating first.");

  it("1.19  A user can not associate with a wallet which isn't a contributor.");
});
