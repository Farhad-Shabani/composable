import { expect } from "chai";
import { ApiPromise } from "@polkadot/api";
import testConfiguration from "./test_configuration.json";
import { KeyringPair } from "@polkadot/keyring/types";
import { getNewConnection } from "@composable/utils/connectionHelper";
import { getDevWallets } from "@composable/utils/walletHelper";
import { mintAssetsToWallet } from "@composable/utils/mintingHelper";
import * as pablo from "@composable/utils/pablo";
import { Phase2 } from "@composabletests/tests/launch-tests/testHelper";
import BN from "bn.js";

/**
 * Test suite for verifying phase 2 of the launch process.
 *
 * 2A. Seed KSM/USDC pool
 *  - Pool config: 50/50 Uniswap AMM w/ 0.15% fee.
 *  - Tests add/remove liquidity to/from the pool by users.
 *  - Tests stake/unstake LP tokens by users.
 *  - Tests pool receiving farming rewards.
 *  - Tests trading fees & distribution.
 *  - No users are allowed to create own pools during this phase.
 * 2B. Launch PICA via LBP event
 *  - Pool consists of USDC only.
 *  - Pool starts 98/2, finishing at 50/50.
 * 2C. Seed PICA/USDC pool
 *  - Pool config: 50/50 Uniswap AMM w/ 0.2% fee.
 *  - KSDM/USDC remains unchanged.
 *  - Pool receives additional PBLO farming rewards.
 *  - PICA/KSM will be created.
 * 2D. Add multiple pools
 *  - USDC/aUSD
 *  - - Stableswap AMM, 0.1% fee.
 *  - wETH/KSM
 *  - - Uniswap 50/50 AMM, 0.15% fee.
 *  - wBTC/KSM
 *  - - Uniswap 50/50 AMM, 0.15% fee.
 *  - USDC/USDT
 *  - - Stableswap AMM, 0.1% fee.
 */
// ToDo (D. Roth): Remove `SHORT` tag.
describe.only("[SHORT] Picasso/Pablo Launch Plan - Phase 2", function() {
  if (!testConfiguration.enabledTests.query.enabled) return;

  let api: ApiPromise;
  let sudoKey: KeyringPair,
    composableManagerWallet: KeyringPair,
    liquidityProviderWallet1: KeyringPair;
  let ksmUsdcPoolId: BN,
    ksmUsdcLpTokenId: BN,
    picaLBPPoolId: number,
    picaUsdcPoolId: number,
    picaKsmPoolId: number;
  const picaAssetId = 1,
    ksmAssetId = 4,
    usdcAssetId = 131;
  const baseAmount = 250000000000000000n;
  const quoteAmount = 250000000000000000n;
  const minMintAmount = 0;

  before("Setting up the tests", async function() {
    this.timeout(60 * 1000);
    const { newClient, newKeyring } = await getNewConnection();
    api = newClient;

    const { devWalletAlice } = getDevWallets(newKeyring);
    sudoKey = devWalletAlice;
    composableManagerWallet = devWalletAlice;
    liquidityProviderWallet1 = devWalletAlice.derive("/test/launch/lp1");
  });

  before("Minting assets", async function() {
    this.timeout(5 * 60 * 1000);
    await mintAssetsToWallet(api, composableManagerWallet, sudoKey, [1, ksmAssetId, usdcAssetId]);
    await mintAssetsToWallet(api, liquidityProviderWallet1, sudoKey, [1, ksmAssetId, usdcAssetId]);
  });

  after("Closing the connection", async function() {
    await api.disconnect();
  });

  /**
   * 2A. Seed KSM/USDC pool
   *  - Pool config: 50/50 Uniswap AMM w/ 0.15% fee.
   *  - Tests add/remove liquidity to/from the pool by users.
   *  - Tests stake/unstake LP tokens by users.
   *  - Tests pool receiving farming rewards.
   *  - Tests trading fees & distribution.
   */
  describe("Picasso/Pablo Launch Plan - Phase 2A", function() {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    describe("Test 2A pool creation", function() {
      it.only("Users can not create a pablo pool.", async function() {
        this.timeout(2 * 60 * 1000);

        const fee = 150000;
        const baseWeight = 500000;
        const baseAsset = ksmAssetId;
        const quoteAsset = usdcAssetId;
        const { data: [result] } = await pablo.uniswap.createMarket(
          api,
          sudoKey,
          composableManagerWallet.publicKey,
          baseAsset,
          quoteAsset,
          fee,
          baseWeight
        );
        // ToDo: Update to expect error!
        const { poolId, lpTokenId } = await Phase2.verifyLastPoolCreation(
          api,
          api.createType("PalletPabloPoolConfiguration", {
            ConstantProduct: {
              owner: composableManagerWallet.publicKey,
              pair: {
                base: baseAsset,
                quote: quoteAsset
              },
              lpToken: 100_000_000_000n,
              feeConfig: {
                feeRate: fee,
                ownerFeeRate: 200000,
                protocolFeeRate: 1000000
              },
              baseWeight: baseWeight,
              quoteWeight: baseWeight
            }
          })
        );
        ksmUsdcPoolId = poolId;
        ksmUsdcLpTokenId = lpTokenId;
      });

      it("Create KSM/USDC uniswap pool by root.", async function() {
        this.timeout(2 * 60 * 1000);

        const fee = 150000;
        const baseWeight = 500000;
        const baseAsset = ksmAssetId;
        const quoteAsset = usdcAssetId;

        const { data: [result] } = await pablo.uniswap.sudo.sudoCreateMarket(
          api,
          sudoKey,
          composableManagerWallet.publicKey,
          baseAsset,
          quoteAsset,
          fee,
          baseWeight
        );
        expect(result.isOk).to.be.true;
      });
    });

    describe("Test 2A pool liquidity", function() {
      describe("Test 2A pool add liquidity", function() {
        it.only("Users can add liquidity to the pool", async function() {
          this.timeout(2 * 60 * 1000);
          const lpTokenBalanceBefore = await api.rpc.assets.balanceOf(ksmUsdcLpTokenId.toString(), liquidityProviderWallet1.publicKey);
          const { data: [result] } = await pablo.addLiquidity(api, liquidityProviderWallet1, ksmUsdcPoolId, baseAmount, quoteAmount, minMintAmount, true);
          const lpTokenBalanceAfter = await api.rpc.assets.balanceOf(ksmUsdcLpTokenId.toString(), liquidityProviderWallet1.publicKey);
          expect(new BN(lpTokenBalanceAfter.toString())).to.be.bignumber
            .greaterThan(new BN(lpTokenBalanceBefore.toString()));
        });

        it("Pool owner (root) can add liquidity to the pool", async function() {
          this.timeout(2 * 60 * 1000);
          const lpTokenBalanceBefore = await api.rpc.assets.balanceOf(ksmUsdcLpTokenId.toString(), liquidityProviderWallet1.publicKey);
          const { data: [result] } = await pablo.sudo.sudoAddLiquidity(api, sudoKey, ksmUsdcPoolId, baseAmount, quoteAmount, minMintAmount, true);
          const lpTokenBalanceAfter = await api.rpc.assets.balanceOf(ksmUsdcLpTokenId.toString(), liquidityProviderWallet1.publicKey);
          expect(new BN(lpTokenBalanceAfter.toString())).to.be.bignumber
            .greaterThan(new BN(lpTokenBalanceBefore.toString()));
        });
      });

      describe("Test 2A pool remove liquidity", function() {
        it.only("Users can remove liquidity from the pool", async function() {
          this.timeout(2 * 60 * 1000);
          const lpTokenBalanceBefore = await api.rpc.assets.balanceOf(ksmUsdcLpTokenId.toString(), liquidityProviderWallet1.publicKey);
          const lpAmount = new BN(lpTokenBalanceBefore.toString()).div(new BN(2));
          const baseAmount = 0;
          const quoteAmount = 0;
          const { data: [result] } = await pablo.removeLiquidity(api, liquidityProviderWallet1, ksmUsdcPoolId, lpAmount, baseAmount, quoteAmount);
          const lpTokenBalanceAfter = await api.rpc.assets.balanceOf(ksmUsdcLpTokenId.toString(), liquidityProviderWallet1.publicKey);
          expect(new BN(lpTokenBalanceAfter.toString())).to.be.bignumber
            .lessThan(new BN(lpTokenBalanceBefore.toString()));
        });
        it("Pool owner can remove liquidity from the pool", async function() {
          this.timeout(2 * 60 * 1000);
          const lpTokenBalanceBefore = await api.rpc.assets.balanceOf(ksmUsdcLpTokenId.toString(), liquidityProviderWallet1.publicKey);
          const lpAmount = new BN(lpTokenBalanceBefore.toString()).div(new BN(2));
          const baseAmount = 0;
          const quoteAmount = 0;
          const { data: [result] } = await pablo.sudo.sudoRemoveLiquidity(api, sudoKey, ksmUsdcPoolId, lpAmount, baseAmount, quoteAmount);
          const lpTokenBalanceAfter = await api.rpc.assets.balanceOf(ksmUsdcLpTokenId.toString(), liquidityProviderWallet1.publicKey);
          expect(new BN(lpTokenBalanceAfter.toString())).to.be.bignumber
            .lessThan(new BN(lpTokenBalanceBefore.toString()));
        });
      });
    });

    describe("Test 2A trading", function() {
      describe("Test 2A buy", function() {
        it("Users can buy from pool", async function() {
          // ToDo: Implement when pablo staking is done.
        });
      });

      describe("Test 2A sell", function() {
        it("Users can sell to pool", async function() {
          // ToDo: Implement when pablo staking is done.
        });
      });

      describe("Test 2A swap", function() {
        it("Users can swap in the pool", async function() {
          // ToDo: Implement when pablo staking is done.
        });
      });
    });

    describe("Test 2A pool stake", function() {
      describe("Test 2A pool stake", function() {
        it("Users can stake LP tokens", async function() {
          // ToDo: Implement when pablo staking is done.
        });
      });

      describe("Test 2A pool unstake", function() {
        it("Users can unstake LP tokens", async function() {
          // ToDo: Implement when pablo staking is done.
        });
      });
    });

    describe("Test 2A pool farming rewards", function() {
      // ToDo: Implement when pablo staking is done.
    });
  });

  /**
   * 2B. Launch PICA via LBP event
   *  - Pool consists of USDC only.
   *  - Pool starts 98/2, finishing at 50/50.
   */
  describe("Picasso/Pablo Launch Plan - Phase 2B", function() {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it.only("Create PICA LBP w/ USDC", async function() {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const currentBlock = await api.query.system.number();
      const baseAsset = picaAssetId;
      const quoteAsset = usdcAssetId;
      const saleStart = currentBlock.toNumber() + 5;
      const saleEnd = currentBlock.toNumber() + 50;
      const initialWeight = 980000;
      const finalWeight = 500000;
      const feeRate = 0;
      const ownerFeeRate = 0;
      const protocolFeeRate = 0;
      const result = await pablo.liquidityBootstrapping.createMarket(
        api,
        composableManagerWallet,
        composableManagerWallet.publicKey,
        picaAssetId,
        usdcAssetId,
        saleStart,
        saleEnd,
        initialWeight,
        finalWeight,
        feeRate,
        ownerFeeRate,
        protocolFeeRate
      );
      await Phase2.verifyLastPoolCreation(api, api.createType("PalletPabloPoolConfiguration", {
        LiquidityBootstrapping: {
          owner: api.createType("AccountId32", composableManagerWallet.publicKey),
          pair: api.createType("ComposableTraitsDefiCurrencyPairCurrencyId", {
            base: api.createType("u128", baseAsset),
            quote: api.createType("u128", quoteAsset)
          }),
          sale: api.createType("ComposableTraitsDexSale", {
            start: api.createType("u32", saleStart),
            end: api.createType("u32", saleEnd),
            initialWeight: api.createType("Permill", initialWeight),
            finalWeight: api.createType("Permill", finalWeight)
          }),
          feeConfig: api.createType("ComposableTraitsDexFeeConfig", {
            feeRate: api.createType("Permill", feeRate),
            ownerFeeRate: api.createType("Permill", ownerFeeRate),
            protocolFeeRate: api.createType("Permill", protocolFeeRate)
          })
        }
      }));
    });
  });

  /**
   * 2C. Seed PICA/USDC pool
   *  - Pool config: 50/50 Uniswap AMM w/ 0.2% fee.
   *  - KSDM/USDC remains unchanged.
   *  - Pool receives additional PBLO farming rewards.
   *  - PICA/KSM will be created.
   */
  describe("Picasso/Pablo Launch Plan - Phase 2C", function() {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it("Create PICA/USDC pool", async function() {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const fee = 200000;
      const baseWeight = 500000;
      const { data: [result] } = await pablo.uniswap.sudo.sudoCreateMarket(
        api,
        sudoKey,
        composableManagerWallet.publicKey,
        picaAssetId,
        usdcAssetId,
        fee,
        baseWeight
      );
      expect(result.isOk).to.be.true;
    });

    it("Create PICA/KSM pool", async function() {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);

      const fee = 200000;
      const baseWeight = 500000;
      const { data: [result] } = await pablo.uniswap.sudo.sudoCreateMarket(
        api,
        sudoKey,
        composableManagerWallet.publicKey,
        picaAssetId,
        usdcAssetId,
        fee,
        baseWeight
      );
    });
  });

  /**
   * 2D. Add multiple pools
   *  - USDC/aUSD
   *  - - Stableswap AMM, 0.1% fee.
   *  - wETH/KSM
   *  - - Uniswap 50/50 AMM, 0.15% fee.
   *  - wBTC/KSM
   *  - - Uniswap 50/50 AMM, 0.15% fee.
   *  - USDC/USDT
   *  - - Stableswap AMM, 0.1% fee.
   */
  describe("Picasso/Pablo Launch Plan - Phase 2D", function() {
    if (!testConfiguration.enabledTests.query.account__success.enabled) return;

    it("Create USDC/aUSD stableswap pool", async function() {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const amplificationCoefficient = 24; // ToDo: Update!
      const fee = 100000; // ToDo: Update!
      const { data: [result] } = await pablo.stableswap.sudo.sudoCreateMarket(
        api,
        sudoKey,
        composableManagerWallet.publicKey,
        picaAssetId,
        usdcAssetId,
        amplificationCoefficient,
        fee
      );
      expect(result.isOk).to.be.true;
    });

    it("Create wETH/KSM uniswap pool", async function() {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);

      const fee = 150000;
      const baseWeight = 500000;
      const { data: [result] } = await pablo.uniswap.sudo.sudoCreateMarket(
        api,
        sudoKey,
        composableManagerWallet.publicKey,
        picaAssetId,
        usdcAssetId,
        fee,
        baseWeight
      );
      expect(result.isOk).to.be.true;
    });

    it("Create wBTC/KSM uniswap pool", async function() {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);
      const fee = 150000;
      const baseWeight = 500000;
      const { data: [result] } = await pablo.uniswap.sudo.sudoCreateMarket(
        api,
        sudoKey,
        composableManagerWallet.publicKey,
        picaAssetId,
        usdcAssetId,
        fee,
        baseWeight
      );
      expect(result.isOk).to.be.true;
    });

    it("Create USDC/USDT stableswap pool", async function() {
      if (!testConfiguration.enabledTests.query.account__success.balanceGTZero1) this.skip();
      this.timeout(2 * 60 * 1000);

      const amplificationCoefficient = 24; // ToDo: Update!
      const fee = 100000; // ToDo: Update!
      const { data: [result] } = await pablo.uniswap.sudo.sudoCreateMarket(
        api,
        sudoKey,
        composableManagerWallet.publicKey,
        picaAssetId,
        usdcAssetId,
        amplificationCoefficient,
        fee
      );
      expect(result.isOk).to.be.true;
    });
  });
});
