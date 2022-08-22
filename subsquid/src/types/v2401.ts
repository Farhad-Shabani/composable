import type {Result} from './support'

export type AccountId32 = Uint8Array

export type CurrencyId = bigint

export interface CurrencyPair {
  base: CurrencyId
  quote: CurrencyId
}

export interface Fee {
  fee: bigint
  lpFee: bigint
  ownerFee: bigint
  protocolFee: bigint
  assetId: CurrencyId
}

export type VestingScheduleIdSet = VestingScheduleIdSet_All | VestingScheduleIdSet_One | VestingScheduleIdSet_Many

export interface VestingScheduleIdSet_All {
  __kind: 'All'
}

export interface VestingScheduleIdSet_One {
  __kind: 'One'
  value: bigint
}

export interface VestingScheduleIdSet_Many {
  __kind: 'Many'
  value: bigint[]
}

export interface VestingSchedule {
  vestingScheduleId: bigint
  window: VestingWindow
  periodCount: number
  perPeriod: bigint
  alreadyClaimed: bigint
}

export type VestingWindow = VestingWindow_MomentBased | VestingWindow_BlockNumberBased

export interface VestingWindow_MomentBased {
  __kind: 'MomentBased'
  start: bigint
  period: bigint
}

export interface VestingWindow_BlockNumberBased {
  __kind: 'BlockNumberBased'
  start: number
  period: number
}
