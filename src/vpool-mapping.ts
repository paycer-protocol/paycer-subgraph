import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
	Deposit,
	Withdraw,
} from "../generated/vUSDCPool/VPool"
import { VPoolStat, GlobalStat, DayStat } from "../generated/schema"

function loadOrCreatePoolStat(id: string): VPoolStat {
	let stat = VPoolStat.load(id);
	if (!stat) {
		stat = new VPoolStat(id);
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

function loadOrCreateDayStat(id: string): DayStat {
	let stat = DayStat.load(id);
	if (!stat) {
		stat = new DayStat(id);
		stat.save();
	}
	return stat;
}

export function handleVPoolDeposit(event: Deposit): void {
	const poolStat = loadOrCreatePoolStat(event.address.toString());
	poolStat.tvl = poolStat.tvl.plus(event.params.amount);
	poolStat.volume = poolStat.volume.plus(event.params.amount);
	poolStat.totalTransactions = poolStat.totalTransactions.plus(BigInt.fromI32(1));
	if (poolStat.walletAddrs.includes(event.params.owner)) {
		poolStat.walletAddrs.push(event.params.owner)
	}
	poolStat.save();

	const globalState = loadOrCreateGlobal();
	globalState.totalTransactions = globalState.totalTransactions.plus(BigInt.fromI32(1));
	globalState.save();
}

export function handleVPoolWithdraw(event: Withdraw): void {
	const poolStat = loadOrCreatePoolStat(event.address.toString());
	poolStat.tvl = poolStat.tvl.minus(event.params.amount);
	poolStat.volume = poolStat.volume.plus(event.params.amount);
	poolStat.totalTransactions = poolStat.totalTransactions.plus(BigInt.fromI32(1));
	if (poolStat.walletAddrs.includes(event.params.owner)) {
		poolStat.walletAddrs.push(event.params.owner)
	}
	poolStat.save();

	const globalState = loadOrCreateGlobal();
	globalState.totalTransactions = globalState.totalTransactions.plus(BigInt.fromI32(1));
	globalState.save();
}