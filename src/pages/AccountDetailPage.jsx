import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/common/Card';
import TransactionList from '../components/transactions/TransactionList';
import { useStickyState } from '../hooks/useStickyState';
import { formatCurrency, formatDateForInput, getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, formatRangeLabel } from '../lib/utils';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const AccountDetailPage = ({ account, finTrackData, txModalControls }) => {
	const { transactions, accounts, categories, currency } = finTrackData;
	const [filterPeriod, setFilterPeriod] = useStickyState("monthly", `fintrack-accdetail-filter-period-${account.id}`);
	const [referenceDate, setReferenceDate] = useStickyState(new Date().toISOString(), `fintrack-accdetail-reference-date-${account.id}`);
	const [filter, setFilter] = useState({ startDate: formatDateForInput(getStartOfMonth(new Date(referenceDate))), endDate: formatDateForInput(getEndOfMonth(new Date(referenceDate))), type: "all" });

	useEffect(() => {
		if (filterPeriod === "custom") return;
		let start, end;
		const ref = new Date(referenceDate);
		switch (filterPeriod) {
			case "daily": start = getStartOfDay(ref); end = getEndOfDay(ref); break;
			case "weekly": start = getStartOfWeek(ref); end = getEndOfWeek(ref); break;
			case "annually": start = getStartOfYear(ref); end = getEndOfYear(ref); break;
			case "monthly": default: start = getStartOfMonth(ref); end = getEndOfMonth(ref); break;
		}
		setFilter((prev) => ({ ...prev, startDate: formatDateForInput(start), endDate: formatDateForInput(end) }));
	}, [filterPeriod, referenceDate]);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilter((prev) => ({ ...prev, [name]: value }));
	};
	const handlePeriodChange = (period) => {
		setFilterPeriod(period);
		if (period !== "custom") setReferenceDate(new Date().toISOString());
	};
	const handlePrev = () => {
		const newDate = new Date(referenceDate);
		switch (filterPeriod) {
			case "daily": newDate.setDate(newDate.getDate() - 1); break;
			case "weekly": newDate.setDate(newDate.getDate() - 7); break;
			case "monthly": newDate.setMonth(newDate.getMonth() - 1); break;
			case "annually": newDate.setFullYear(newDate.getFullYear() - 1); break;
			default: break;
		}
		setReferenceDate(newDate.toISOString());
	};
	const handleNext = () => {
		const newDate = new Date(referenceDate);
		switch (filterPeriod) {
			case "daily": newDate.setDate(newDate.getDate() + 1); break;
			case "weekly": newDate.setDate(newDate.getDate() + 7); break;
			case "monthly": newDate.setMonth(newDate.getMonth() + 1); break;
			case "annually": newDate.setFullYear(newDate.getFullYear() + 1); break;
			default: break;
		}
		setReferenceDate(newDate.toISOString());
	};

	const { filteredTransactions, totalDeposits, totalWithdrawals, netTotal } = useMemo(() => {
		const specialCategories = Object.keys(categories.special || {});
		let deposits = 0, withdrawals = 0;
		const transactionsInPeriod = transactions.filter((tx) => {
			const txDate = new Date(tx.date + "T00:00:00");
			const startDate = new Date(filter.startDate + "T00:00:00");
			const endDate = new Date(filter.endDate + "T00:00:00");
			return txDate >= startDate && txDate <= endDate;
		});
		const accountTransactions = transactionsInPeriod.filter((tx) => {
			if (tx.type === "transfer") return tx.from === account.id || tx.to === account.id;
			return tx.accountId === account.id;
		});
		accountTransactions.forEach((tx) => {
			if (tx.type === "income" || (tx.type === "transfer" && tx.to === account.id)) deposits += tx.amount;
			else if (tx.type === "expense" || (tx.type === "transfer" && tx.from === account.id)) {
				withdrawals += tx.amount;
				if (tx.type === "transfer" && tx.fee) withdrawals += tx.fee;
			}
		});
		const filteredList = accountTransactions.filter((tx) => {
			if (filter.type === "all") return true;
			if ((filter.type === "income" || filter.type === "expense") && specialCategories.includes(tx.category)) return false;
			return tx.type === filter.type;
		});
		return { filteredTransactions: filteredList, totalDeposits: deposits, totalWithdrawals: withdrawals, netTotal: deposits - withdrawals };
	}, [transactions, filter, account.id, categories]);

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
					<div>
						<h3 className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Deposits</h3>
						<p className="text-base md:text-lg font-semibold text-green-500">{formatCurrency(totalDeposits, currency)}</p>
					</div>
					<div>
						<h3 className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Withdrawals</h3>
						<p className="text-base md:text-lg font-semibold text-red-500">{formatCurrency(totalWithdrawals, currency)}</p>
					</div>
					<div>
						<h3 className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Net Total</h3>
						<p className={`text-base md:text-lg font-semibold ${netTotal >= 0 ? "text-green-500" : "text-red-500"}`}>{formatCurrency(netTotal, currency)}</p>
					</div>
					<div>
						<h3 className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Balance</h3>
						<p className="text-base md:text-lg font-semibold">{formatCurrency(account.balance, currency)}</p>
					</div>
				</div>
				{(account.interestRate || account.dueDate) && (
					<div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-around text-xs md:text-sm text-gray-500 dark:text-gray-400">
						{account.interestRate && <p>Interest: <strong>{account.interestRate}%</strong></p>}
						{account.dueDate && <p>Due Date: <strong>{new Date(account.dueDate + "T00:00:00").toLocaleDateString()}</strong></p>}
					</div>
				)}
			</Card>
			<div className="bg-white dark:bg-gray-800 p-4 md:px-6 shadow-sm">
				<div className="relative flex justify-center items-center gap-2 mb-4">
					<button onClick={handlePrev} disabled={filterPeriod === "custom"} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-5 w-5" /></button>
					<span className="font-semibold text-center w-auto sm:w-48 flex-shrink-0">{formatRangeLabel(filterPeriod, new Date(referenceDate))}</span>
					<button onClick={handleNext} disabled={filterPeriod === "custom"} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-5 w-5" /></button>
					<button onClick={() => handlePeriodChange("custom")} className={`absolute top-0 right-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${filterPeriod === "custom" ? "text-indigo-600" : ""}`}><Filter size={20} /></button>
				</div>
				<div className="flex justify-center flex-wrap gap-2 mb-4 border-b dark:border-gray-700 pb-4">
					{["daily", "weekly", "monthly", "annually"].map((p) => (<button key={p} onClick={() => handlePeriodChange(p)} className={`px-3 py-1 text-sm rounded-full capitalize ${filterPeriod === p ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}>{p}</button>))}
				</div>
				{filterPeriod === "custom" && (
					<div className="grid grid-cols-2 gap-4 items-end mb-4">
						<div>
							<label htmlFor="startDate" className="text-sm font-medium text-gray-600 dark:text-gray-300">Start Date</label>
							<input type="date" name="startDate" id="startDate" value={filter.startDate} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
						</div>
						<div>
							<label htmlFor="endDate" className="text-sm font-medium text-gray-600 dark:text-gray-300">End Date</label>
							<input type="date" name="endDate" id="endDate" value={filter.endDate} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
						</div>
					</div>
				)}
				<div className="grid grid-cols-1 gap-4 items-end">
					<div>
						<label htmlFor="type" className="text-sm font-medium text-gray-600 dark:text-gray-300">Type</label>
						<select name="type" id="type" value={filter.type} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							<option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option><option value="transfer">Transfer</option>
						</select>
					</div>
				</div>
			</div>
			<div className="p-4 md:p-6 md:pt-0">
				<TransactionList title="Transactions" transactions={filteredTransactions} txModalControls={txModalControls} accounts={accounts} categories={categories} currency={currency} contextAccountId={account.id} />
			</div>
		</div>
	);
};

export default AccountDetailPage;
