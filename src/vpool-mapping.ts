import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
	Deposit,
	Withdraw,
} from "../generated/USDCPool/VPool"
import { VPoolStat, GlobalStat, VPoolDayState } from "../generated/schema"

function loadOrCreatePoolStat(id: string): VPoolStat {
	let stat = VPoolStat.load(id);
	if (!stat) {
		stat = new VPoolStat(id);
		stat.save();
	}
	return stat;
}

function loadOrCreatePoolDailyStat(id: string): VPoolDayState {
	let stat = VPoolDayState.load(id);
	if (!stat) {
		stat = new VPoolDayState(id);
		stat.save();
	}
	return stat;
}

function loadOrCreateGlobal(): GlobalStat {
	let stat = GlobalStat.load("1");
	if (!stat) {
		stat = new GlobalStat("1");
		stat.save();
	}
	return stat;
}

export function handleVPoolDeposit(event: Deposit): void {
	// Update pool state
	const poolAddr = event.address.toHex()
	const poolStat = loadOrCreatePoolStat(poolAddr);
	poolStat.tvl = poolStat.tvl.plus(event.params.amount);
	poolStat.volume = poolStat.volume.plus(event.params.amount);
	poolStat.totalTransactions = poolStat.totalTransactions.plus(BigInt.fromI32(1));
	let wallets = poolStat.walletAddrs;
	if (!wallets.includes(event.params.owner.toHex())) {
		wallets.push(event.params.owner.toHex());
	}
	poolStat.walletAddrs = wallets;
	poolStat.save();

	// Update pool daily state
	const day = event.block.timestamp.toI32() / 86400;
	const poolDayStat = loadOrCreatePoolDailyStat(`${poolAddr}-${day}`);
	poolDayStat.timestamp = event.block.timestamp;
	poolDayStat.dailyTransactions = poolDayStat.dailyTransactions.plus(BigInt.fromI32(1));
	poolDayStat.dailyVolume = poolDayStat.dailyVolume.plus(event.params.amount);
	poolDayStat.pool = poolAddr;
	wallets = poolDayStat.walletAddrs;
	if (!wallets.includes(event.params.owner.toHex())) {
		wallets.push(event.params.owner.toHex());
	}
	poolDayStat.walletAddrs = wallets;
	poolDayStat.save();

	// Update global state
	const globalState = loadOrCreateGlobal();
	globalState.totalTransactions = globalState.totalTransactions.plus(BigInt.fromI32(1));
	globalState.save();
}

export function handleVPoolWithdraw(event: Withdraw): void {
	// Update pool state
	const poolAddr = event.address.toHex()
	const poolStat = loadOrCreatePoolStat(poolAddr);
	poolStat.tvl = poolStat.tvl.minus(event.params.amount);
	poolStat.volume = poolStat.volume.plus(event.params.amount);
	poolStat.totalTransactions = poolStat.totalTransactions.plus(BigInt.fromI32(1));
	let wallets = poolStat.walletAddrs;
	if (!wallets.includes(event.params.owner.toHex())) {
		wallets.push(event.params.owner.toHex());
	}
	poolStat.walletAddrs = wallets;
	poolStat.save();

	// Update pool daily state
	const day = event.block.timestamp.toI32() / 86400;
	const poolDayStat = loadOrCreatePoolDailyStat(`${poolAddr}-${day}`);
	poolDayStat.timestamp = event.block.timestamp;
	poolDayStat.dailyTransactions = poolDayStat.dailyTransactions.plus(BigInt.fromI32(1));
	poolDayStat.dailyVolume = poolDayStat.dailyVolume.plus(event.params.amount);
	poolDayStat.pool = poolAddr;
	wallets = poolDayStat.walletAddrs;
	if (!wallets.includes(event.params.owner.toHex())) {
		wallets.push(event.params.owner.toHex());
	}
	poolDayStat.walletAddrs = wallets;
	poolDayStat.save();

	// Update global state
	const globalState = loadOrCreateGlobal();
	globalState.totalTransactions = globalState.totalTransactions.plus(BigInt.fromI32(1));
	globalState.save();
}