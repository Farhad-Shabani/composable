import assert from 'assert'
import {EventContext, Result, deprecateLatest} from './support'
import * as v2401 from './v2401'

export class BalancesDepositEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Deposit')
  }

  /**
   * Some amount was deposited (e.g. for transaction fees).
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('balances.Deposit') === 'e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5'
  }

  /**
   * Some amount was deposited (e.g. for transaction fees).
   */
  get asV2401(): {who: v2401.AccountId32, amount: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {who: v2401.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class BalancesSlashedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Slashed')
  }

  /**
   * Some amount was removed from the account (e.g. for misbehavior).
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('balances.Slashed') === 'e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5'
  }

  /**
   * Some amount was removed from the account (e.g. for misbehavior).
   */
  get asV2401(): {who: v2401.AccountId32, amount: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {who: v2401.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class BalancesTransferEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Transfer')
  }

  /**
   * Transfer succeeded.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === '0ffdf35c495114c2d42a8bf6c241483fd5334ca0198662e14480ad040f1e3a66'
  }

  /**
   * Transfer succeeded.
   */
  get asV2401(): {from: v2401.AccountId32, to: v2401.AccountId32, amount: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {from: v2401.AccountId32, to: v2401.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class BalancesWithdrawEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Withdraw')
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees).
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('balances.Withdraw') === 'e84a34a6a3d577b31f16557bd304282f4fe4cbd7115377f4687635dc48e52ba5'
  }

  /**
   * Some amount was withdrawn from the account (e.g. for transaction fees).
   */
  get asV2401(): {who: v2401.AccountId32, amount: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {who: v2401.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class BondedFinanceNewBondEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'bondedFinance.NewBond')
  }

  /**
   * A new bond has been registered.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('bondedFinance.NewBond') === '2942193f166c2272b5592760fffb7e7332ca1fc91ea21d50ddf0a60dd35cddb7'
  }

  /**
   * A new bond has been registered.
   */
  get asV2401(): {offerId: bigint, who: v2401.AccountId32, nbOfBonds: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {offerId: bigint, who: v2401.AccountId32, nbOfBonds: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class BondedFinanceNewOfferEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'bondedFinance.NewOffer')
  }

  /**
   * A new offer has been created.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('bondedFinance.NewOffer') === '68b798e0fb8f433f37ecc5a1efa5af84a146a217c123fba86d358fdc60508217'
  }

  /**
   * A new offer has been created.
   */
  get asV2401(): {offerId: bigint, beneficiary: v2401.AccountId32} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {offerId: bigint, beneficiary: v2401.AccountId32} {
    deprecateLatest()
    return this.asV2401
  }
}

export class BondedFinanceOfferCancelledEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'bondedFinance.OfferCancelled')
  }

  /**
   * An offer has been cancelled by the `AdminOrigin`.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('bondedFinance.OfferCancelled') === 'a31df34b423037e305dbc2946d691428051e98fb362268dc0e78aff52ab30840'
  }

  /**
   * An offer has been cancelled by the `AdminOrigin`.
   */
  get asV2401(): {offerId: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {offerId: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class OraclePriceChangedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'oracle.PriceChanged')
  }

  /**
   * Price changed by oracle \[asset_id, price\]
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('oracle.PriceChanged') === 'f7d5bd1431cb954502149f64a8137986d660e0729a3d9731d421496b4298be52'
  }

  /**
   * Price changed by oracle \[asset_id, price\]
   */
  get asV2401(): [v2401.CurrencyId, bigint] {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): [v2401.CurrencyId, bigint] {
    deprecateLatest()
    return this.asV2401
  }
}

export class PabloLiquidityAddedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'pablo.LiquidityAdded')
  }

  /**
   * Liquidity added into the pool `T::PoolId`.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('pablo.LiquidityAdded') === '312d582090ea3aa5c6ba6b929f4114d4a54ddca29cc066e4de5540c288ce5464'
  }

  /**
   * Liquidity added into the pool `T::PoolId`.
   */
  get asV2401(): {who: v2401.AccountId32, poolId: bigint, baseAmount: bigint, quoteAmount: bigint, mintedLp: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {who: v2401.AccountId32, poolId: bigint, baseAmount: bigint, quoteAmount: bigint, mintedLp: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class PabloLiquidityRemovedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'pablo.LiquidityRemoved')
  }

  /**
   * Liquidity removed from pool `T::PoolId` by `T::AccountId` in balanced way.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('pablo.LiquidityRemoved') === 'ef123c9326de7ce47d183c1b7d729db3c90f89a6bd64122aa03a48c169c6aa5b'
  }

  /**
   * Liquidity removed from pool `T::PoolId` by `T::AccountId` in balanced way.
   */
  get asV2401(): {who: v2401.AccountId32, poolId: bigint, baseAmount: bigint, quoteAmount: bigint, totalIssuance: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {who: v2401.AccountId32, poolId: bigint, baseAmount: bigint, quoteAmount: bigint, totalIssuance: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class PabloPoolCreatedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'pablo.PoolCreated')
  }

  /**
   * Pool with specified id `T::PoolId` was created successfully by `T::AccountId`.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('pablo.PoolCreated') === '76b660a348da63e9f657f2e6efbf072d8b02fe00cce4524df8e49986c270e996'
  }

  /**
   * Pool with specified id `T::PoolId` was created successfully by `T::AccountId`.
   */
  get asV2401(): {poolId: bigint, owner: v2401.AccountId32, assets: v2401.CurrencyPair} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {poolId: bigint, owner: v2401.AccountId32, assets: v2401.CurrencyPair} {
    deprecateLatest()
    return this.asV2401
  }
}

export class PabloPoolDeletedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'pablo.PoolDeleted')
  }

  /**
   * The sale ended, the funds repatriated and the pool deleted.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('pablo.PoolDeleted') === '1b2177997ab30c1eecba237f26886dc4fce241682664c0c2ccd6fa478d585089'
  }

  /**
   * The sale ended, the funds repatriated and the pool deleted.
   */
  get asV2401(): {poolId: bigint, baseAmount: bigint, quoteAmount: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {poolId: bigint, baseAmount: bigint, quoteAmount: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class PabloSwappedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'pablo.Swapped')
  }

  /**
   * Token exchange happened.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('pablo.Swapped') === 'e2cb97932583cb6d0722d9449b471d2ea8b363ac4580591664fe7471b8e463bb'
  }

  /**
   * Token exchange happened.
   */
  get asV2401(): {poolId: bigint, who: v2401.AccountId32, baseAsset: v2401.CurrencyId, quoteAsset: v2401.CurrencyId, baseAmount: bigint, quoteAmount: bigint, fee: v2401.Fee} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {poolId: bigint, who: v2401.AccountId32, baseAsset: v2401.CurrencyId, quoteAsset: v2401.CurrencyId, baseAmount: bigint, quoteAmount: bigint, fee: v2401.Fee} {
    deprecateLatest()
    return this.asV2401
  }
}

export class StakingRewardsRewardPoolCreatedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'stakingRewards.RewardPoolCreated')
  }

  /**
   * Pool with specified id `T::RewardPoolId` was created successfully by `T::AccountId`.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('stakingRewards.RewardPoolCreated') === 'c1a7d8c28ed34c95044288fd755b6243bfb8451b8f7bb43754a90d57fedb3529'
  }

  /**
   * Pool with specified id `T::RewardPoolId` was created successfully by `T::AccountId`.
   */
  get asV2401(): {poolId: bigint, owner: v2401.AccountId32, endBlock: number, assetId: v2401.CurrencyId} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {poolId: bigint, owner: v2401.AccountId32, endBlock: number, assetId: v2401.CurrencyId} {
    deprecateLatest()
    return this.asV2401
  }
}

export class StakingRewardsSplitPositionEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'stakingRewards.SplitPosition')
  }

  /**
   * Split stake position into two positions
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('stakingRewards.SplitPosition') === '5d9eb209c412b137d1ef45620c5151241d00f670ec3e855e9e2d7fec32b88ccc'
  }

  /**
   * Split stake position into two positions
   */
  get asV2401(): {positions: [bigint, bigint][]} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {positions: [bigint, bigint][]} {
    deprecateLatest()
    return this.asV2401
  }
}

export class StakingRewardsStakeAmountExtendedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'stakingRewards.StakeAmountExtended')
  }

  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('stakingRewards.StakeAmountExtended') === '9b62bc61f3b135250dbe07edc824ed6e892ce57d5e350302f3f80b5a1d202768'
  }

  get asV2401(): {positionId: bigint, amount: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {positionId: bigint, amount: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class StakingRewardsStakedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'stakingRewards.Staked')
  }

  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('stakingRewards.Staked') === '9bd2bf805153832d25298c66acf49d2bcbbce04060a4d9b68d5e3221557e2c3e'
  }

  get asV2401(): {poolId: bigint, owner: v2401.AccountId32, amount: bigint, durationPreset: bigint, positionId: bigint, keepAlive: boolean} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {poolId: bigint, owner: v2401.AccountId32, amount: bigint, durationPreset: bigint, positionId: bigint, keepAlive: boolean} {
    deprecateLatest()
    return this.asV2401
  }
}

export class StakingRewardsUnstakedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'stakingRewards.Unstaked')
  }

  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('stakingRewards.Unstaked') === 'a77303deb074b7208720e047715198fb967f6c69ff250d6b1a1a5a58a1a0e665'
  }

  get asV2401(): {owner: v2401.AccountId32, positionId: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {owner: v2401.AccountId32, positionId: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class VestingClaimedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vesting.Claimed')
  }

  /**
   * Claimed vesting.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('vesting.Claimed') === '1158bd677eb4e5aad57841bad2e35470c5be3bbc33b843378d69a8cf7bfced30'
  }

  /**
   * Claimed vesting.
   */
  get asV2401(): {who: v2401.AccountId32, asset: v2401.CurrencyId, vestingScheduleIds: v2401.VestingScheduleIdSet, lockedAmount: bigint, claimedAmountPerSchedule: [bigint, bigint][]} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {who: v2401.AccountId32, asset: v2401.CurrencyId, vestingScheduleIds: v2401.VestingScheduleIdSet, lockedAmount: bigint, claimedAmountPerSchedule: [bigint, bigint][]} {
    deprecateLatest()
    return this.asV2401
  }
}

export class VestingVestingScheduleAddedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vesting.VestingScheduleAdded')
  }

  /**
   * Added new vesting schedule.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('vesting.VestingScheduleAdded') === '76bb06af4efc9a40f5604bfe9dbe980d1cec79e966fe1f641bb9475c65a6808d'
  }

  /**
   * Added new vesting schedule.
   */
  get asV2401(): {from: v2401.AccountId32, to: v2401.AccountId32, asset: v2401.CurrencyId, vestingScheduleId: bigint, schedule: v2401.VestingSchedule, scheduleAmount: bigint} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {from: v2401.AccountId32, to: v2401.AccountId32, asset: v2401.CurrencyId, vestingScheduleId: bigint, schedule: v2401.VestingSchedule, scheduleAmount: bigint} {
    deprecateLatest()
    return this.asV2401
  }
}

export class VestingVestingSchedulesUpdatedEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'vesting.VestingSchedulesUpdated')
  }

  /**
   * Updated vesting schedules.
   */
  get isV2401(): boolean {
    return this.ctx._chain.getEventHash('vesting.VestingSchedulesUpdated') === 'b8a0d2208835f6ada60dd21cd93533d703777b3779109a7c6a2f26bad68c2f3b'
  }

  /**
   * Updated vesting schedules.
   */
  get asV2401(): {who: v2401.AccountId32} {
    assert(this.isV2401)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV2401
  }

  get asLatest(): {who: v2401.AccountId32} {
    deprecateLatest()
    return this.asV2401
  }
}
