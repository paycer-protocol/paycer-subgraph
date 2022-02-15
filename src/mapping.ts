import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
  Deposit,
  EmergencyWithdraw,
  Withdraw,
} from "../generated/Staking/Staking"
import {
  Withdraw as VestingWithdraw,
} from "../generated/TeamVesting/Vesting"
import {
  Transfer
} from "../generated/ERC20/ERC20"
import { Account, DayStat, GlobalStat } from "../generated/schema"

function loadOrCreateGlobal(): GlobalStat {
  let stat = GlobalStat.load("1");
  if (!stat) {
    stat = new GlobalStat("1");
    stat.save();
  }
  return stat;
}

function loadOrCreateStat(id: string): DayStat {
  let stat = DayStat.load(id);
  if (!stat) {
    stat = new DayStat(id);
    stat.save();
  }
  return stat;
}

export function handleDeposit(event: Deposit): void {
  const global = loadOrCreateGlobal();
  const day = event.block.timestamp.toI32() / 86400;
  const stat = loadOrCreateStat(day.toString());
  stat.timestamp = event.block.timestamp;
  global.staking = global.staking.plus(event.params.amount);
  stat.staking = global.staking;
  stat.dailyStaked = stat.dailyStaked.plus(event.params.amount);

  global.totalTransactions = global.totalTransactions.plus(BigInt.fromI32(1));
  stat.dailyTransactions = stat.dailyTransactions.plus(BigInt.fromI32(1));

  stat.save();
  global.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  const global = loadOrCreateGlobal();
  const day = event.block.timestamp.toI32() / 86400;
  const stat = loadOrCreateStat(day.toString());
  stat.timestamp = event.block.timestamp;
  global.staking = global.staking.minus(event.params.amount);
  stat.staking = global.staking;
  stat.dailyWithdrawn = stat.dailyWithdrawn.plus(event.params.amount);

  global.totalTransactions = global.totalTransactions.plus(BigInt.fromI32(1));
  stat.dailyTransactions = stat.dailyTransactions.plus(BigInt.fromI32(1));

  stat.save();
  global.save();
}

export function handleWithdraw(event: Withdraw): void {
  const global = loadOrCreateGlobal();
  const day = event.block.timestamp.toI32() / 86400;
  const stat = loadOrCreateStat(day.toString());
  stat.timestamp = event.block.timestamp;
  global.staking = global.staking.minus(event.params.amount);
  stat.staking = global.staking;
  stat.dailyWithdrawn = stat.dailyWithdrawn.plus(event.params.amount);

  global.totalTransactions = global.totalTransactions.plus(BigInt.fromI32(1));
  stat.dailyTransactions = stat.dailyTransactions.plus(BigInt.fromI32(1));

  stat.save();
  global.save();
}

export function handleVestingWithdraw(event: VestingWithdraw): void {
  const global = loadOrCreateGlobal();
  const day = event.block.timestamp.toI32() / 86400;
  const stat = loadOrCreateStat(day.toString());
  stat.timestamp = event.block.timestamp;
  global.vesting = global.vesting.plus(event.params.amountWithdrawn);
  stat.vesting = global.vesting;
  stat.dailyVestingWithdrawn = stat.dailyWithdrawn.plus(event.params.amountWithdrawn);

  global.totalTransactions = global.totalTransactions.plus(BigInt.fromI32(1));
  stat.dailyTransactions = stat.dailyTransactions.plus(BigInt.fromI32(1));

  stat.save();
  global.save();
}

export function handleTransfer(event: Transfer): void {
  const global = loadOrCreateGlobal();
  const day = event.block.timestamp.toI32() / 86400;
  const stat = loadOrCreateStat(day.toString());

  let fromAccount = Account.load(event.params.from.toHex())
  let toAccount = Account.load(event.params.to.toHex())

  if (fromAccount) {
    fromAccount.amount = fromAccount.amount.minus(event.params.value);
    fromAccount.save()

    if (fromAccount.amount.equals(BigInt.zero())) {
      global.holders = global.holders.minus(BigInt.fromI32(1));
      stat.dailyHolders = stat.dailyHolders.minus(BigInt.fromI32(1));
    }
  }

  if (!toAccount) {
    toAccount = new Account(event.params.to.toHex())
    toAccount.owner = event.params.to
  }

  if (toAccount.amount.equals(BigInt.zero())) {
    global.holders = global.holders.plus(BigInt.fromI32(1));
    stat.dailyHolders = stat.dailyHolders.plus(BigInt.fromI32(1));
  }

  toAccount.amount = toAccount.amount.plus(event.params.value);
  toAccount.save()

  stat.holders = global.holders;
  stat.save()
  global.save()
}
