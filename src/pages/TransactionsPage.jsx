import React, { useState, useEffect, useMemo } from 'react';
import TransactionList from '../components/transactions/TransactionList';
import { useStickyState } from '../hooks/useStickyState';
import { formatCurrency, formatDateForInput, getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, formatRangeLabel } from '../lib/utils';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const TransactionsPage = ({ finTrackData, txModalControls }) => {
	const { transactions, accounts, categories, currency } = finTrackData;
	const [filterPeriod, setFilterPeriod] = useStickyState("monthly", "fintrack-tx-filter-period");
	const [referenceDate, setReferenceDate] = useStickyState(new Date().toISOString(), "fintrack-tx-reference-date");
	const [filter, setFilter] = useState({ startDate: formatDateForInput(getStartOfMonth(new Date(referenceDate))), endDate: formatDateForInput(getEndOfMonth(new Date(referenceDate))), type: "all", accountId: "all" });

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

	const { filteredTransactions, totalIncome, totalExpenses } = useMemo(() => {
		const specialCategories = Object.keys(categories.special || {});
		let totalIncome = 0, totalExpenses = 0;
		const transactionsInPeriod = transactions.filter((tx) => tx.date >= filter.startDate && tx.date <= filter.endDate);
		transactionsInPeriod.forEach((tx) => {
			const toAccount = accounts.find((a) => a.id === tx.to);
			if (tx.type === "income" && !specialCategories.includes(tx.category)) totalIncome += tx.amount;
			else if (tx.type === "expense" && !specialCategories.includes(tx.category)) totalExpenses += tx.amount;
			else if (tx.type === "transfer") {
				if (toAccount?.type === "Liability") totalExpenses += tx.amount;
			}
		});
		const filteredTransactions = transactionsInPeriod.filter((tx) => {
			if (filter.accountId !== "all") {
				if (tx.type === "transfer") { if (tx.from !== filter.accountId && tx.to !== filter.accountId) return false; }
				else if (tx.accountId !== filter.accountId) return false;
			}
			if (filter.type === "all") return true;
			if (specialCategories.includes(tx.category)) return false;
			if (filter.type === "income") { if (tx.type === "income") return true; }
			if (filter.type === "expense") { if (tx.type === "expense") return true; }
			return tx.type === filter.type;
		});
		return { filteredTransactions, totalIncome, totalExpenses };
	}, [transactions, filter, categories, accounts]);

	return (
		<div className="space-y-6">
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
				<div className="grid grid-cols-2 gap-4 items-end">
					<div>
						<label htmlFor="type" className="text-sm font-medium text-gray-600 dark:text-gray-300">Type</label>
						<select name="type" id="type" value={filter.type} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							<option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option><option value="transfer">Transfer</option>
						</select>
					</div>
					<div>
						<label htmlFor="accountId" className="text-sm font-medium text-gray-600 dark:text-gray-300">Account</label>
						<select name="accountId" id="accountId" value={filter.accountId} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							<option value="all">All Accounts</option>
							{accounts.map((acc) => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}
						</select>
					</div>
				</div>
				<div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
					<div className="flex justify-around text-center">
						<div>
							<h3 className="text-sm text-gray-500 dark:text-gray-400">Total Income</h3>
							<p className="text-lg font-semibold text-green-500">{formatCurrency(totalIncome, currency)}</p>
						</div>
						<div>
							<h3 className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</h3>
							<p className="text-lg font-semibold text-red-500">{formatCurrency(totalExpenses, currency)}</p>
						</div>
					</div>
				</div>
			</div>
			<div className="p-4 md:p-6 md:pt-0">
				<TransactionList title="Transactions" transactions={filteredTransactions} txModalControls={txModalControls} accounts={accounts} categories={categories} currency={currency} contextAccountId={filter.accountId} />
			</div>
		</div>
	);
};

export default TransactionsPage;
