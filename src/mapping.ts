import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
  Deposit,
  EmergencyWithdraw,
  Withdraw,
} from "../generated/Staking/Staking"
import {
  Transfer
} from "../generated/ERC20/ERC20"
import { Account, DayStat } from "../generated/schema"

function getOrCreateStat(id: string): DayStat {
  let stat = DayStat.load(id);

  if (!stat) {
    stat = new DayStat(id);
    stat.save();
  }

  return stat;
}

export function handleDeposit(event: Deposit): void {
  const day = event.block.timestamp.toI32() / 86400;
  const stat = getOrCreateStat(day.toString());
  stat.timestamp = event.block.timestamp;
  stat.staking = stat.staking.plus(event.params.amount);
  stat.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  const day = event.block.timestamp.toI32() / 86400;
  const stat = getOrCreateStat(day.toString());
  stat.timestamp = event.block.timestamp;
  stat.staking = stat.staking.minus(event.params.amount);
  stat.save();
}

export function handleWithdraw(event: Withdraw): void {
  const day = event.block.timestamp.toI32() / 86400;
  const stat = getOrCreateStat(day.toString());
  stat.timestamp = event.block.timestamp;
  stat.staking = stat.staking.minus(event.params.amount);
  stat.save();
}

export function handleTransfer(event: Transfer): void {
  const day = event.block.timestamp.toI32() / 86400;
  const stat = getOrCreateStat(day.toString());

  let fromAccount = Account.load(event.params.from.toHex())
  let toAccount = Account.load(event.params.to.toHex())

  if (fromAccount) {
    fromAccount.amount = fromAccount.amount.minus(event.params.value);
    fromAccount.save()

    if (fromAccount.amount.equals(BigInt.zero())) {
      stat.holders = stat.holders.minus(BigInt.fromI32(1));
    }
  }

  if (!toAccount) {
    toAccount = new Account(event.params.to.toHex())
    toAccount.owner = event.params.to
    stat.holders = stat.holders.plus(BigInt.fromI32(1));
  }

  toAccount.amount = toAccount.amount.plus(event.params.value);
  toAccount.save()

  stat.save()
}
