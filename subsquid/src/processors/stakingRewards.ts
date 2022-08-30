import { EventHandlerContext } from "@subsquid/substrate-processor";
import { randomUUID } from "crypto";
import {
  StakingRewardsRewardPoolCreatedEvent,
  StakingRewardsSplitPositionEvent,
  StakingRewardsStakeAmountExtendedEvent,
  StakingRewardsStakedEvent,
  StakingRewardsUnstakedEvent,
} from "../types/events";
import { saveAccountAndTransaction } from "../dbHelper";
import { PicassoStakingPosition, PicassoTransactionType } from "../model";
import { encodeAccount } from "../utils";

interface RewardPoolCreatedEvent {
  poolId: number;
  owner: Uint8Array;
  endBlock: number;
}

interface StakedEvent {
  poolId: number;
  owner: Uint8Array;
  amount: bigint;
  durationPreset: bigint;
  positionId: bigint;
  keepAlive: boolean;
}

interface UnstakedEvent {
  owner: Uint8Array;
  positionId: bigint;
}

interface StakeAmountExtendedEvent {
  positionId: bigint;
  amount: bigint;
}

interface SplitPositionEvent {
  positions: bigint[];
}

function getRewardPoolCreatedEvent(
  event: StakingRewardsRewardPoolCreatedEvent
): RewardPoolCreatedEvent {
  const { poolId, owner, endBlock } = event.asV2401 ?? event.asLatest;
  return { poolId, owner, endBlock };
}

function getStakedEvent(event: StakingRewardsStakedEvent): StakedEvent {
  const { poolId, owner, amount, durationPreset, positionId, keepAlive } =
    event.asV2401 ?? event.asLatest;
  return { poolId, owner, amount, durationPreset, positionId, keepAlive };
}

function getUnstakedEvent(event: StakingRewardsUnstakedEvent): UnstakedEvent {
  const { positionId, owner } = event.asV2401 ?? event.asLatest;
  return { positionId, owner };
}

function getStakeAmountExtendedEvent(
  event: StakingRewardsStakeAmountExtendedEvent
): StakeAmountExtendedEvent {
  const { positionId, amount } = event.asV2401 ?? event.asLatest;
  return { positionId, amount };
}

function getSplitPositionEvent(
  event: StakingRewardsSplitPositionEvent
): SplitPositionEvent {
  const { positions } = event.asV2401 ?? event.asLatest;
  return { positions };
}

/**
 * Create new PicassoStakingPosition.
 * @param poolId
 * @param positionId
 * @param owner
 * @param amount
 * @param duration
 */
export function createPicassoStakingPosition(
  poolId: number,
  positionId: bigint,
  owner: string,
  amount: bigint,
  duration: bigint
): PicassoStakingPosition {
  const startTimestamp = BigInt(new Date().valueOf());
  return new PicassoStakingPosition({
    id: randomUUID(),
    poolId: poolId.toString(),
    positionId: positionId.toString(),
    owner,
    amount,
    startTimestamp,
    endTimestamp: BigInt(startTimestamp + BigInt(duration * 1_000n)),
  });
}

/**
 * Update position's amount in place.
 * @param position
 * @param newAmount
 */
export function extendPicassoStakingPosition(
  position: PicassoStakingPosition,
  newAmount: bigint
): void {
  position.amount = newAmount;
}

/**
 * Split PicassoStakingPosition in 2.
 * Updates existing position in place, and returns new additional position.
 * @param position
 * @param oldAmount
 * @param newAmount
 * @param newPositionId
 */
export function splitPicassoStakingPosition(
  position: PicassoStakingPosition,
  oldAmount: bigint,
  newAmount: bigint,
  newPositionId: bigint
): PicassoStakingPosition {
  position.amount = oldAmount;

  const newPosition = new PicassoStakingPosition({
    id: randomUUID(),
    poolId: position.poolId,
    positionId: newPositionId.toString(),
    owner: position.owner,
    amount: newAmount,
    startTimestamp: position.startTimestamp,
    endTimestamp: position.endTimestamp,
  });

  return newPosition;
}

/**
 * Process `stakingRewards.RewardPoolCreated` event.
 *  - Update account and store transaction.
 * @param ctx
 */
export async function processRewardPoolCreatedEvent(
  ctx: EventHandlerContext
): Promise<void> {
  console.log("Start processing `reward pool created`");
  const evt = new StakingRewardsRewardPoolCreatedEvent(ctx);
  const event = getRewardPoolCreatedEvent(evt);
  const owner = encodeAccount(event.owner);

  await saveAccountAndTransaction(
    ctx,
    PicassoTransactionType.STAKING_REWARDS_REWARD_POOL_CREATED,
    owner
  );
}

/**
 * Process `stakingRewards.Staked` event.
 *  - Create PicassoStakingPosition.
 *  - Update account and store transaction.
 * @param ctx
 */
export async function processStakedEvent(
  ctx: EventHandlerContext
): Promise<void> {
  console.log("Start processing `staked`");
  const evt = new StakingRewardsStakedEvent(ctx);
  const event = getStakedEvent(evt);
  const owner = encodeAccount(event.owner);
  const { poolId, positionId, amount, durationPreset } = event;

  const stakingPosition = createPicassoStakingPosition(
    poolId,
    positionId,
    owner,
    amount,
    durationPreset
  );

  stakingPosition.eventId = ctx.event.id;

  await ctx.store.save(stakingPosition);

  await saveAccountAndTransaction(
    ctx,
    PicassoTransactionType.STAKING_REWARDS_STAKED,
    owner
  );
}

/**
 * Process `stakingRewards.StakeAmountExtended` event.
 *  - Update amount for PicassoStakingPosition.
 *  - Update account and store transaction.
 * @param ctx
 */
export async function processStakeAmountExtendedEvent(
  ctx: EventHandlerContext
): Promise<void> {
  console.log("Start processing `StakeAmountExtended`");
  const evt = new StakingRewardsStakeAmountExtendedEvent(ctx);
  const event = getStakeAmountExtendedEvent(evt);
  const { positionId, amount } = event;

  const stakingPosition = await ctx.store.get(PicassoStakingPosition, {
    where: { positionId },
  });

  if (!stakingPosition) {
    // no-op
    return;
  }

  extendPicassoStakingPosition(stakingPosition, amount);

  await saveAccountAndTransaction(
    ctx,
    PicassoTransactionType.STAKING_REWARDS_STAKE_AMOUNT_EXTENDED,
    stakingPosition.owner
  );
}

/**
 * Process `stakingRewards.Unstaked` event.
 *  - Set amount for PicassoStakingPosition to 0.
 *  - Update account and store transaction.
 * @param ctx
 */
export async function processUnstakedEvent(
  ctx: EventHandlerContext
): Promise<void> {
  console.log("Start processing `Unstaked`");
  const evt = new StakingRewardsUnstakedEvent(ctx);
  const event = getUnstakedEvent(evt);
  const owner = encodeAccount(event.owner);

  await saveAccountAndTransaction(
    ctx,
    PicassoTransactionType.STAKING_REWARDS_UNSTAKE,
    owner
  );
}

/**
 * Process `stakingRewards.SplitPosition` event.
 *  - Update amount for existing PicassoStakingPosition.
 *  - Create new PicassoStakingPosition. TODO: add amounts to the pallet event
 *  - Update account and store transaction.
 * @param ctx
 */
export async function processSplitPositionEvent(
  ctx: EventHandlerContext
): Promise<void> {
  console.log("Start processing `SplitPosition`");
  const evt = new StakingRewardsSplitPositionEvent(ctx);
  const event = getSplitPositionEvent(evt);
  const { positions } = event;
  const [oldPositionId, newPositionId] = positions;

  const position = await ctx.store.get(PicassoStakingPosition, {
    where: {
      positionId: oldPositionId,
    },
  });

  if (!position) {
    // no-op.
    return;
  }

  const newPosition = splitPicassoStakingPosition(
    position,
    1n,
    1n,
    newPositionId
  );

  if (!newPosition) {
    // no-op.
    return;
  }

  position.eventId = ctx.event.id;
  newPosition.eventId = ctx.event.id;

  await ctx.store.save(position);
  await ctx.store.save(newPosition);

  // TODO: add data about new positions

  await saveAccountAndTransaction(
    ctx,
    PicassoTransactionType.STAKING_REWARDS_SPLIT_POSITION,
    position.owner
  );
}
