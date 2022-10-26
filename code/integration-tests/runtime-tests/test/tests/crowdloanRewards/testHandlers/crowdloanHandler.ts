import { KeyringPair } from "@polkadot/keyring/types";
import { sendAndWaitForSuccess } from "@composable/utils/polkadotjs";
import { AnyNumber, IKeyringPair, ITuple } from "@polkadot/types/types";
import { PalletCrowdloanRewardsModelsRemoteAccount } from "@composable/types/interfaces";
import { Compact, u128, u32, u64, Vec } from "@polkadot/types-codec";
import { shares, totalPicaRewarded } from "@composabletests/tests/crowdloanRewards/contributions.json";
import { expect } from "chai";
import Web3 from "web3";
import { ApiPromise } from "@polkadot/api";
import BN from "bn.js";
import { AccountId32 } from "@polkadot/types/interfaces";

const toHexString = (bytes: any) =>
  Array.prototype.map.call(bytes, x => ("0" + (x & 0xff).toString(16)).slice(-2)).join("");

// The prefix is defined as pallet config
const proofMessage = (account: IKeyringPair, isEth = false) =>
  (isEth ? "picasso-" : "<Bytes>picasso-") + toHexString(account.publicKey) + (isEth ? "" : "</Bytes>");

export const ethAccount = (seed: string) => new Web3().eth.accounts.create(seed);

export const getSumOfContributorRewardsAmount = () => {
  return new BN(totalPicaRewarded).mul(new BN(10).pow(new BN(12)));
};

export const getKsmProofMessage = (
  api: ApiPromise,
  contributor: KeyringPair,
  contributorRewardAccount: IKeyringPair
) => {
  return api.createType("PalletCrowdloanRewardsModelsProof", {
    RelayChain: [contributor.publicKey, { Sr25519: contributor.sign(proofMessage(contributorRewardAccount)) }]
  });
};

export const getEthProofMessage = (
  api: ApiPromise,
  contributor: { sign: (arg0: string) => any },
  contributorRewardAccount: IKeyringPair
) => {
  return api.createType("PalletCrowdloanRewardsModelsProof", {
    Ethereum: contributor.sign(proofMessage(contributorRewardAccount, true)).signature
  });
};

export const getKsmContributorWallet = (testWallet: KeyringPair) => {
  return testWallet.derive("/contributor");
};

export class TxCrowdloanRewardsTests {
  /**
   * Providing the crowdloan pallet with funds
   *
   * Unfortunately we can't directly mint into the pallet therefore after minting we just transfer the funds.
   *
   * @param {ApiPromise} api Connected API Client.
   * @param {KeyringPair} sudoKey Wallet with sudo rights.
   * @param amount
   */
  public static async mintAndTransferFundsToCrowdloanPallet(
    api: ApiPromise,
    sudoKey: KeyringPair,
    amount: u128 | Compact<u128> | AnyNumber
  ) {
    const {
      data: [result]
    } = await sendAndWaitForSuccess(
      api,
      sudoKey,
      api.events.sudo.Sudid.is,
      api.tx.sudo.sudo(api.tx.assets.mintInto(1, sudoKey.publicKey, amount))
    );
    expect(result).to.not.be.an("Error");
    const palletPublicKey = api.consts.crowdloanRewards.accountId;
    return await sendAndWaitForSuccess(
      api,
      sudoKey,
      api.events.balances.Transfer.is,
      api.tx.balances.transfer(palletPublicKey, amount)
    );
  }

  /**
   * tx.crowdloanRewards.initialize
   *
   * @param {ApiPromise} api Connected API Client.
   * @param {KeyringPair} sudoKey Wallet with sudo rights.
   */
  public static txCrowdloanRewardsInitializeTest(api: ApiPromise, sudoKey: KeyringPair) {
    return sendAndWaitForSuccess(
      api,
      sudoKey,
      api.events.sudo.Sudid.is,
      api.tx.sudo.sudo(api.tx.crowdloanRewards.initialize())
    );
  }

  /**
   * Helper to populate the crowdloan pallet with all contributors,
   * plus some testing wallets which are passed by an parameter.
   *
   * @param {ApiPromise} api Connected API Client.
   * @param {KeyringPair} sudoKey Wallet with sudo rights.
   * @param testWallets
   * @param testWalletShareAmountPICA
   * @param vestingPeriod
   */
  public static async txCrowdloanRewardsPopulateTest(
    api: ApiPromise,
    sudoKey: KeyringPair,
    testWallets: KeyringPair[],
    testWalletShareAmountPICA = 100,
    vestingPeriod: number | bigint | BN = 100800
  ) {
    let fullRewardAmount = new BN(0);

    // ToDo: Vesting time has changed from blocks to milliseconds!
    const vestingTime = api.createType("u32", vestingPeriod);

    let contributors: Array<[PalletCrowdloanRewardsModelsRemoteAccount, u128, u32]> = [];
    // Before we go through all the contributors, we inject our test wallet at the very beginning.
    const testContributorReward = api.createType("u128", Math.pow(testWalletShareAmountPICA, 12));
    for (const [i, testWallet] of testWallets.entries()) {
      let testContributorRemoteObject: PalletCrowdloanRewardsModelsRemoteAccount;
      testContributorRemoteObject = api.createType("PalletCrowdloanRewardsModelsRemoteAccount", {
        Ethereum: ethAccount(testWallet.address).address
      });
      fullRewardAmount = fullRewardAmount.add(testContributorReward);
      contributors.push([testContributorRemoteObject, testContributorReward, vestingTime]);
      testContributorRemoteObject = api.createType("PalletCrowdloanRewardsModelsRemoteAccount", {
        RelayChain: getKsmContributorWallet(testWallet).publicKey
      });
      fullRewardAmount = fullRewardAmount.add(testContributorReward);
      contributors.push([testContributorRemoteObject, testContributorReward, vestingTime]);
    }

    // Now we can continue collecting & populating our actual contributors.
    // Iterating through our list of contributors
    let i = 0;
    const allContributors: Array<[PalletCrowdloanRewardsModelsRemoteAccount, u128, u32]> = [];
    for (const [key, value] of Object.entries(shares)) {
      let remoteAccountObject: PalletCrowdloanRewardsModelsRemoteAccount;
      // Creating either an ethereum or ksm contributor object.
      if (key.startsWith("0x"))
        remoteAccountObject = api.createType("PalletCrowdloanRewardsModelsRemoteAccount", { Ethereum: key });
      else
        remoteAccountObject = api.createType("PalletCrowdloanRewardsModelsRemoteAccount", {
          RelayChain: api.createType("AccountId32", key)
        });
      const currentContributorAmount = new BN(parseInt(value).toFixed(0)).mul(new BN(10).pow(new BN(12)));
      fullRewardAmount = fullRewardAmount.add(currentContributorAmount);
      contributors.push([remoteAccountObject, api.createType("u128", currentContributorAmount), vestingTime]);

      // Every 2500th iteration we send our list of contributors, else we'd break the block data size limit.
      if (
        (i % 2500 == 0 && i != 0) ||
        (Object.entries(shares).length - i < 2500 && Object.entries(shares).length == i - 1)
      ) {
        // Actual population step.
        const {
          data: [result]
        } = await TxCrowdloanRewardsTests.txCrowdloanRewardsPopulateTestHandler(api, sudoKey, contributors);
        expect(result.isOk).to.be.true;
        contributors.forEach(contributor => allContributors.push(contributor));
        contributors = [];
      }
      i++;
    }
    return { fullRewardAmount, allContributors };
  }

  public static async verifyCrowdloanRewardsPopulation(
    api: ApiPromise,
    contributors: Array<[PalletCrowdloanRewardsModelsRemoteAccount, u128, u32]>
  ) {
    for (const contributor of contributors) {
      const rewardsQuery = await api.query.crowdloanRewards.rewards(contributor[0]);
      expect(rewardsQuery.unwrap().claimed).to.be.bignumber.equal(new BN(0));
      expect(rewardsQuery.unwrap().total).to.be.bignumber.equal(contributor[1]);
      expect(rewardsQuery.unwrap().vestingPeriod).to.be.bignumber.equal(contributor[2]);
    }
  }

  /**
   * tx.crowdloanRewards.populate
   *
   * @param {ApiPromise} api Connected ApiClient
   * @param {KeyringPair} sudoKey Wallet with sudo rights.
   * @param {KeyringPair} contributors List of contributors to be transacted.
   */
  public static async txCrowdloanRewardsPopulateTestHandler(
    api: ApiPromise,
    sudoKey: KeyringPair,
    contributors:
      | [PalletCrowdloanRewardsModelsRemoteAccount, u128, u32][]
      | Vec<ITuple<[PalletCrowdloanRewardsModelsRemoteAccount, u128, u64]>>
      | [
          string | Uint8Array | PalletCrowdloanRewardsModelsRemoteAccount | { RelayChain: any } | { Ethereum: any },
          u128 | AnyNumber,
          AnyNumber | u64
        ][]
  ) {
    return await sendAndWaitForSuccess(
      api,
      sudoKey,
      api.events.sudo.Sudid.is,
      api.tx.sudo.sudo(api.tx.crowdloanRewards.populate(contributors))
    );
  }

  // /**
  //  * tx.crowdloanRewards.associate RelayChain
  //  *
  //  * @param {ApiPromise} api Connected ApiPromise
  //  * @param {KeyringPair} contributor The contributor relay chain wallet public key.
  //  * @param {KeyringPair} contributorRewardAccount The wallet the contributor wants to receive their PICA to.
  //  */
  // public static async txCrowdloanRewardsRelayAssociateTests(
  //   api: ApiPromise,
  //   contributor: KeyringPair,
  //   contributorRewardAccount: IKeyringPair
  // ) {
  //   // arbitrary, user defined reward account
  //   const proof = getProofMessage(contributor, contributorRewardAccount);
  //   return await sendUnsignedAndWaitForSuccess(
  //     api,
  //     api.events.crowdloanRewards.Associated.is,
  //     api.tx.crowdloanRewards.associate(
  //       contributorRewardAccount.publicKey,
  //       api.createType("PalletCrowdloanRewardsModelsProof", { RelayChain: [contributor.publicKey, { Sr25519: proof }] })
  //     )
  //   );
  // }
  //
  // /**
  //  * tx.crowdloanRewards.associate ETH Chain
  //  *
  //  * @param {ApiClient} api Connected ApiClient
  //  * @param {KeyringPair} contributor The contributor ETH chain wallet public key.
  //  * @param {KeyringPair} contributorRewardAccount The wallet the contributor wants to receive their PICA to.
  //  */
  // public static async txCrowdloanRewardsEthAssociateTest(
  //   api: ApiPromise,
  //   contributor: { sign: (arg0: string) => any },
  //   contributorRewardAccount: IKeyringPair
  // ) {
  //   const proof = contributor.sign(proofMessage(contributorRewardAccount, true));
  //   return await sendUnsignedAndWaitForSuccess(
  //     api,
  //     api.events.crowdloanRewards.Associated.is,
  //     api.tx.crowdloanRewards.associate(
  //       contributorRewardAccount.publicKey,
  //       api.createType("PalletCrowdloanRewardsModelsProof", { Ethereum: proof.signature })
  //     )
  //   );
  // }

  /**
   * tx.crowdloanRewards.claim
   *
   * @param {ApiClient} api Connected ApiClient
   * @param { KeyringPair } wallet The reward account which tries to claim.
   */
  public static async txCrowdloanRewardsClaimTest(api: ApiPromise, wallet: KeyringPair) {
    return await sendAndWaitForSuccess(
      api,
      wallet,
      api.events.crowdloanRewards.Claimed.is,
      api.tx.crowdloanRewards.claim()
    );
  }

  public static async verifyKsmAssociation(
    api: ApiPromise,
    resultRemoteAccount: PalletCrowdloanRewardsModelsRemoteAccount,
    resultRewardAccount: AccountId32,
    rewardAccount: KeyringPair
  ) {
    const remoteAccountObject = api.createType("PalletCrowdloanRewardsModelsRemoteAccount", {
      RelayChain: getKsmContributorWallet(rewardAccount).publicKey
    });
    expect(resultRewardAccount.toString()).to.be.equal(rewardAccount.publicKey.toString());

    // Verifying query.
    const associationQuery = await api.query.crowdloanRewards.associations(rewardAccount.publicKey);
    expect(resultRemoteAccount.toString()) // Result from extrinsic.
      .to.be.equal(associationQuery.unwrap().toString()) // Result from query.
      .to.be.equal(remoteAccountObject.toString()); // Expected
  }
}
