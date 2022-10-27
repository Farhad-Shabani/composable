import { expect } from "chai";
import { KeyringPair } from "@polkadot/keyring/types";
import testConfiguration from "./test_configuration.json";
import {
  getAmountAvailableToClaim,
  getEthProofMessage,
  getKsmContributorWallet,
  getKsmProofMessage,
  TxCrowdloanRewardsTests
} from "@composabletests/tests/crowdloanRewards/testHandlers/crowdloanHandler";
import { ApiPromise } from "@polkadot/api";
import { getNewConnection } from "@composable/utils/connectionHelper";
import { getDevWallets } from "@composable/utils/walletHelper";
import { sendAndWaitForSuccess, sendUnsignedAndWaitForSuccess } from "@composable/utils/polkadotjs";
import BN from "bn.js";
import { CustomRpcBalance, PalletCrowdloanRewardsModelsProof } from "@composable/types/interfaces";

const AMOUNT_CONTRIBUTOR_WALLETS = 8;
const TEST_WALLET_PICA_REWARD_AMOUNT = new BN(100);
const INITIAL_ASSOCIATE_CLAIM_PERCENT = 25;

describe("CrowdloanRewards Tests", function () {
  if (!testConfiguration.enabledTests.tx.enabled) return;
  this.retries(0);
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

  it("1.1  I can, as sudo, populate the Crowdloan pallet with the list of contributorRewardWallets.", async function () {
    // 5 minutes timeout
    this.timeout(10 * 60 * 1000);

    const { fullRewardAmount, allContributors } = await TxCrowdloanRewardsTests.txCrowdloanRewardsPopulateTest(
      api,
      sudoKey,
      contributorRewardWallets,
      TEST_WALLET_PICA_REWARD_AMOUNT,
      999_999_99_999_999_999n
    );
    contributorsRewardAmount = fullRewardAmount;
    await TxCrowdloanRewardsTests.verifyCrowdloanRewardsPopulation(api, allContributors);
  });

  /*
  The following steps occur after the pallet has been populated with contributorRewardWallets.
   */

  it("1.2  I can not associate my KSM contributor wallet before the crowdloan pallet has been initialized.", async function () {
    this.timeout(2 * 60 * 1000);
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

  it("1.17  I can not, as sudo, initialize the crowdloan pallet without providing at least as many funds as will be rewarded.", async function () {
    this.timeout(2 * 60 * 1000);
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

  it("1.3  I can, as sudo, initialize the Crowdloan Pallet", async function () {
    // 2 minutes timeout
    this.timeout(60 * 2 * 1000);

    // ToDo: Provide funds!
    const requiredPalletFunds = contributorsRewardAmount;
    await TxCrowdloanRewardsTests.mintAndTransferFundsToCrowdloanPallet(
      api,
      sudoKey,
      requiredPalletFunds.sub(new BN(10).pow(new BN(12)))
    ); // Subtracting 1 PICA from earlier test #1.17

    const {
      data: [result]
    } = await TxCrowdloanRewardsTests.txCrowdloanRewardsInitializeTest(api, sudoKey);
    expect(result.isOk).to.be.true;

    // ToDo: Consider querying start.
  });

  /*
  The following steps occur after the pallet was populated & initialised.
   */
  it("1.4  A user, without initial funds, can associate their contributor KSM wallet with a correct proof & claim 25% of the reward as locked balance.", async function () {
    this.timeout(2 * 60 * 1000);

    // Wallet: Contributor 1
    // Contributor Wallet: KSM Contributor 1
    const rewardAccount = contributorRewardWallets[0];

    const walletBalanceBefore = await api.rpc.assets.balanceOf("1", rewardAccount.publicKey);

    const proofMessage = getKsmProofMessage(api, getKsmContributorWallet(rewardAccount), rewardAccount);
    const {
      data: [resultRemoteAccount, resultRewardAccount]
    } = await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(rewardAccount.publicKey, proofMessage)
    );

    // Verification
    await TxCrowdloanRewardsTests.verifyKsmAssociation(
      api,
      resultRemoteAccount,
      resultRewardAccount,
      rewardAccount,
      TEST_WALLET_PICA_REWARD_AMOUNT,
      walletBalanceBefore,
      INITIAL_ASSOCIATE_CLAIM_PERCENT
    );
  });

  it("1.5  A user (#1.4) can not transfer their claimed funds.", async function () {
    this.timeout(2 * 60 * 1000);

    const wallet = contributorRewardWallets[0];
    const testAmount = new BN(10).pow(new BN(12)); // 1 PICA
    const testTransactions = [
      api.tx.assets.transfer(1, sudoKey.publicKey, testAmount, true),
      api.tx.assets.transferNative(sudoKey.publicKey, testAmount, true)
    ];
    // We can not batch these transactions, due to batch aborting on failure.
    await sendAndWaitForSuccess(api, wallet, api.events.balances.Transfer.is, testTransactions[0]).catch(function (
      err
    ) {
      expect(err.toString()).to.contain("balances.LiquidityRestrictions");
    });
    await sendAndWaitForSuccess(api, wallet, api.events.balances.Transfer.is, testTransactions[1]).catch(function (
      err
    ) {
      expect(err.toString()).to.contain("balances.LiquidityRestrictions");
    });
  });

  it("1.6  A user (#1.4) can claim a second time and pays transaction fees using the claimed, locked balance from earlier.", async function () {
    this.timeout(2 * 60 * 1000);

    const wallet = contributorRewardWallets[0];

    const claimableAmount = getAmountAvailableToClaim(api, wallet.publicKey);
    const {
      data: [resultRemoteAccount, resultRewardAccount, resultAmount]
    } = await sendAndWaitForSuccess(
      api,
      wallet,
      api.events.crowdloanRewards.Claimed.is,
      api.tx.crowdloanRewards.claim()
    );
    expect(resultRemoteAccount).to.not.be.an("Error");
    console.debug("expected", claimableAmount);
    console.debug("is", resultAmount.toHuman());
  });

  it("1.7  A user, with initial funds, can associate their contributor KSM wallet with a correct proof & claim 25% of the reward as locked balance.", async function () {
    this.timeout(2 * 60 * 1000);

    // wallet: Contributor 2
    // Contrib Wallet: KSM Contrib 2

    const wallet = contributorRewardWallets[1];
    const walletBalanceBefore = await api.rpc.assets.balanceOf("1", wallet.publicKey);

    const proofMessage = getKsmProofMessage(api, getKsmContributorWallet(wallet), wallet);
    const {
      data: [resultRemoteAccount, resultRewardAccount]
    } = await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(wallet.publicKey, proofMessage)
    );

    // Verification
    await TxCrowdloanRewardsTests.verifyKsmAssociation(
      api,
      resultRemoteAccount,
      resultRewardAccount,
      wallet,
      TEST_WALLET_PICA_REWARD_AMOUNT,
      walletBalanceBefore,
      INITIAL_ASSOCIATE_CLAIM_PERCENT
    );
  });

  it("1.8  A user, without initial funds, can associate their contributor ETH wallet with a correct proof & claim 25% of the reward as locked balance.", async function () {
    this.timeout(2 * 60 * 1000);

    // wallet: Contributor 3
    // Contrib Wallet: ETH Contrib 1

    const wallet = contributorRewardWallets[2];
    const walletBalanceBefore = await api.rpc.assets.balanceOf("1", wallet.publicKey);

    const proofMessage = getEthProofMessage(api, getKsmContributorWallet(wallet), wallet);
    const {
      data: [resultRemoteAccount, resultRewardAccount]
    } = await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(wallet.publicKey, proofMessage)
    );

    // Verification
    await TxCrowdloanRewardsTests.verifyKsmAssociation(
      api,
      resultRemoteAccount,
      resultRewardAccount,
      wallet,
      TEST_WALLET_PICA_REWARD_AMOUNT,
      walletBalanceBefore,
      INITIAL_ASSOCIATE_CLAIM_PERCENT
    );
  });

  it("1.9  Another user, with initial funds, can associate their contributor ETH wallet with a correct proof & claim 25% of the reward as locked balance.", async function () {
    this.timeout(2 * 60 * 1000);

    // wallet: Contributor 4
    // Contrib Wallet: ETH Contrib 2

    const wallet = contributorRewardWallets[3];
    const walletBalanceBefore = await api.rpc.assets.balanceOf("1", wallet.publicKey);

    const proofMessage = getEthProofMessage(api, getKsmContributorWallet(wallet), wallet);
    const {
      data: [resultRemoteAccount, resultRewardAccount]
    } = await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(wallet.publicKey, proofMessage)
    );

    // Verification
    await TxCrowdloanRewardsTests.verifyKsmAssociation(
      api,
      resultRemoteAccount,
      resultRewardAccount,
      wallet,
      TEST_WALLET_PICA_REWARD_AMOUNT,
      walletBalanceBefore,
      INITIAL_ASSOCIATE_CLAIM_PERCENT
    );
  });

  it("1.10  When claiming after transferring all initial funds from the account (#1.11), the newly claimed balance will be locked.", async function () {
    // 2 minutes timeout
    this.timeout(60 * 2 * 1000);
    // wallet: Contributor 4
    const wallet = contributorRewardWallets[3];

    // Moving all funds from wallet.
    const {
      data: [result]
    } = await sendAndWaitForSuccess(
      api,
      wallet,
      api.events.balances.Transfer.is,
      api.tx.assets.transferAllNative(sudoKey.publicKey, false)
    );
    expect(result).to.not.be.an("Error");

    // Claiming
    const {
      data: [resultRemoteAccount, resultRewardAccount, resultAmount]
    } = await sendAndWaitForSuccess(
      api,
      wallet,
      api.events.crowdloanRewards.Claimed.is,
      api.tx.crowdloanRewards.claim()
    );

    // All remaining available balance should be locked.
    await sendAndWaitForSuccess(
      api,
      wallet,
      api.events.balances.Transfer.is,
      api.tx.assets.transferNative(sudoKey.publicKey, 1_000_000_000_000, false)
    );
  });

  it("1.11  Multiple users can associate successfully, at the same time.", async function () {
    this.timeout(2 * 60 * 1000);
    const wallets = [
      contributorRewardWallets[4],
      contributorRewardWallets[5],
      contributorRewardWallets[6],
      contributorRewardWallets[8]
    ];

    const walletBalancesBefore: CustomRpcBalance[] = [];
    const txs = [];
    for (const wallet of wallets) {
      walletBalancesBefore.push(await api.rpc.assets.balanceOf("1", wallet.publicKey));
      txs.push(
        sendUnsignedAndWaitForSuccess(
          api,
          api.events.crowdloanRewards.Associated.is,
          api.tx.crowdloanRewards.associate(
            wallet.publicKey,
            getKsmProofMessage(api, getKsmContributorWallet(wallet), wallet)
          )
        )
      );
    }
    const [result1, result2, result3, result4] = await Promise.all(txs).catch(function ([err1, err2, err3, err4]) {
      console.debug("err1", err1);
      console.debug("err2", err2);
      console.debug("err3", err3);
      console.debug("err4", err4);
      return [err1, err2, err3, err4];
    });

    console.debug(result1.toString());
    console.debug(result2.toString());
    console.debug(result3.toString());
    console.debug(result4.toString());
    // // Verification
    // await TxCrowdloanRewardsTests.verifyKsmAssociation(
    //   api,
    //   resultRemoteAccount,
    //   resultRewardAccount,
    //   wallet,
    //   TEST_WALLET_PICA_REWARD_AMOUNT,
    //   walletBalanceBefore,
    //   INITIAL_ASSOCIATE_CLAIM_PERCENT
    // );
  });

  it("1.12  Multiple contributorRewardWallets (#1.12) can claim at the same time.", async function () {
    this.timeout(2 * 60 * 1000);
    const wallets = [
      contributorRewardWallets[4],
      contributorRewardWallets[5],
      contributorRewardWallets[6],
      contributorRewardWallets[8]
    ];

    const walletBalancesBefore: CustomRpcBalance[] = [];
    const proofMessages: PalletCrowdloanRewardsModelsProof[] = [];
    const txs = [];
    for (const wallet of wallets) {
      walletBalancesBefore.push(await api.rpc.assets.balanceOf("1", wallet.publicKey));
      txs.push(
        sendAndWaitForSuccess(api, wallet, api.events.crowdloanRewards.Claimed.is, api.tx.crowdloanRewards.claim())
      );
    }
    const err = await Promise.all(txs).catch(function (err) {
      console.debug("err1", err);
      return err;
    });

    console.debug(err.toString());
  });

  it("1.13  A user can not claim twice within the same block.", async function () {
    // Contributor 1

    this.timeout(2 * 60 * 1000);
    const wallet = contributorRewardWallets[0];
    await Promise.all([
      TxCrowdloanRewardsTests.sendClaimsWithDelay(api, wallet, 0),
      TxCrowdloanRewardsTests.sendClaimsWithDelay(api, wallet, 100)
    ]).catch(function (err) {
      console.debug("1.13 catch err", err.toString());
    });
  });

  it("1.14  An already associated wallet can not associate again with a different reward type account.", async function () {
    // Contrib 6
    // Eth Contrib 5
    // KSM contrib 5

    // Assocating w/ eth wallet.
    const wallet = contributorRewardWallets[5];

    const walletBalanceBefore = await api.rpc.assets.balanceOf("1", wallet.publicKey);

    const proofMessage = getEthProofMessage(api, getKsmContributorWallet(wallet), wallet);
    const {
      data: [resultRemoteAccount, resultRewardAccount]
    } = await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(wallet.publicKey, proofMessage)
    );

    // Verification
    await TxCrowdloanRewardsTests.verifyKsmAssociation(
      api,
      resultRemoteAccount,
      resultRewardAccount,
      wallet,
      TEST_WALLET_PICA_REWARD_AMOUNT,
      walletBalanceBefore,
      INITIAL_ASSOCIATE_CLAIM_PERCENT
    );
    // One test claim for good measurement.
    const {
      data: [result]
    } = await sendAndWaitForSuccess(
      api,
      wallet,
      api.events.crowdloanRewards.Claimed.is,
      api.tx.crowdloanRewards.claim()
    );
    expect(result).to.not.be.an("Error");

    // Now we try to re- associate with a different contributor but the same reward wallet.
    const walletBalanceBeforeReAssociation = await api.rpc.assets.balanceOf("1", wallet.publicKey);

    const newProofMessage = getEthProofMessage(api, getKsmContributorWallet(wallet), wallet);
    const {
      data: [resultNewRemoteAccount]
    } = await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(wallet.publicKey, proofMessage)
    );
    console.debug(resultNewRemoteAccount.toHuman());
    // ToDo: Expect error!
  });

  it("1.15  An already associated wallet can not associate the same reward account type a second time.", async function () {
    // Contrib 7
    // KSM Contrib 6
    // KSM contrib 7

    // Assocating w/ eth wallet.
    const wallet = contributorRewardWallets[6];

    const walletBalanceBefore = await api.rpc.assets.balanceOf("1", wallet.publicKey);

    const proofMessage = getKsmProofMessage(api, getKsmContributorWallet(wallet), wallet);
    const {
      data: [resultRemoteAccount, resultRewardAccount]
    } = await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(wallet.publicKey, proofMessage)
    );

    // Verification
    await TxCrowdloanRewardsTests.verifyKsmAssociation(
      api,
      resultRemoteAccount,
      resultRewardAccount,
      wallet,
      TEST_WALLET_PICA_REWARD_AMOUNT,
      walletBalanceBefore,
      INITIAL_ASSOCIATE_CLAIM_PERCENT
    );
    // One test claim for good measurement.
    const {
      data: [result]
    } = await sendAndWaitForSuccess(
      api,
      wallet,
      api.events.crowdloanRewards.Claimed.is,
      api.tx.crowdloanRewards.claim()
    );
    expect(result).to.not.be.an("Error");

    // Now we try to re- associate with a different contributor but the same reward wallet.
    const walletBalanceBeforeReAssociation = await api.rpc.assets.balanceOf("1", wallet.publicKey);

    const newProofMessage = getEthProofMessage(api, getKsmContributorWallet(wallet), wallet);
    const {
      data: [resultNewRemoteAccount]
    } = await sendUnsignedAndWaitForSuccess(
      api,
      api.events.crowdloanRewards.Associated.is,
      api.tx.crowdloanRewards.associate(wallet.publicKey, proofMessage)
    );
    console.debug(resultNewRemoteAccount.toHuman());
    // ToDo: Expect error!
  });

  it("1.16  Someone can re- associate their contributor wallet to a different Picasso wallet.", async function () {
    // Contributor 8
    //
  });

  it("1.17  Someone can not use re- associations to quickly reap 25% of rewards multiple times.");

  it("1.18  A user can not claim without associating first.");

  it("1.19  A user can not associate with a wallet which isn't a contributor.");
});
