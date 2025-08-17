import React, { useState, useMemo } from 'react';
import NetWorthCard from '../components/accounts/NetWorthCard';
import Card from '../components/common/Card';
import SpendingAnalysis from '../components/dashboard/SpendingAnalysis';
import FutureProjection from '../components/dashboard/FutureProjection';
import TransactionList from '../components/transactions/TransactionList';
import { formatCurrency, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, formatRangeLabel } from '../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DashboardPage = ({ finTrackData = {}, txModalControls }) => {
        const {
                transactions = [],
                budgets = [],
                calculatedData = {},
                categories = {},
                accounts = [],
                currency = 'USD',
        } = finTrackData;
	const [filterPeriod, setFilterPeriod] = useState("monthly");
	const [referenceDate, setReferenceDate] = useState(new Date());

	const { income, expenses, net } = useMemo(() => {
		const specialCategories = Object.keys(categories.special || {});
		let start, end;
		const ref = new Date(referenceDate);
		if (filterPeriod === "monthly") { start = getStartOfMonth(ref); end = getEndOfMonth(ref); }
		else { start = getStartOfYear(ref); end = getEndOfYear(ref); }
		let income = 0, expenses = 0;
		transactions
			.filter((tx) => { const txDate = new Date(tx.date + "T00:00:00"); return txDate >= start && txDate <= end; })
			.forEach((tx) => {
				const toAccount = accounts.find((a) => a.id === tx.to);
				if (tx.type === "income" && !specialCategories.includes(tx.category)) income += tx.amount;
				else if (tx.type === "expense" && !specialCategories.includes(tx.category)) expenses += tx.amount;
				else if (tx.type === "transfer") {
					if (toAccount?.type === "Liability") expenses += tx.amount;
				}
			});
		return { income, expenses, net: income - expenses };
	}, [transactions, filterPeriod, referenceDate, accounts, categories]);

	const handlePrev = () => {
		const newDate = new Date(referenceDate);
		if (filterPeriod === "monthly") newDate.setMonth(newDate.getMonth() - 1);
		else newDate.setFullYear(newDate.getFullYear() - 1);
		setReferenceDate(newDate);
	};
	const handleNext = () => {
		const newDate = new Date(referenceDate);
		if (filterPeriod === "monthly") newDate.setMonth(newDate.getMonth() + 1);
		else newDate.setFullYear(newDate.getFullYear() + 1);
		setReferenceDate(newDate);
	};

	return (
		<div className="p-4 md:p-6 space-y-6">
			<NetWorthCard calculatedData={calculatedData} currency={currency} />
			<Card>
				<div className="flex justify-center items-center gap-2 mb-4">
					<button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><ChevronLeft className="h-5 w-5" /></button>
					<span className="font-semibold text-center w-32">{formatRangeLabel(filterPeriod, referenceDate)}</span>
					<button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><ChevronRight className="h-5 w-5" /></button>
				</div>
				<div className="flex justify-center flex-wrap gap-2 mb-4">
					{["monthly", "annually"].map((p) => (<button key={p} onClick={() => setFilterPeriod(p)} className={`px-3 py-1 text-sm rounded-full capitalize ${filterPeriod === p ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}>{p}</button>))}
				</div>
				<div className="flex flex-row justify-around gap-4 text-center">
					<div>
						<h2 className="text-sm font-medium text-gray-500">Income</h2>
						<p className="text-xl font-semibold text-green-500">{formatCurrency(income, currency)}</p>
					</div>
					<div>
						<h2 className="text-sm font-medium text-gray-500">Expenses</h2>
						<p className="text-xl font-semibold text-red-500">{formatCurrency(expenses, currency)}</p>
					</div>
					<div>
						<h2 className="text-sm font-medium text-gray-500">Net</h2>
						<p className={`text-xl font-semibold ${net >= 0 ? "text-green-500" : "text-red-500"}`}>{formatCurrency(net, currency)}</p>
					</div>
				</div>
			</Card>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<SpendingAnalysis transactions={transactions} budget={budgets.find((b) => new Date(b.startDate) <= new Date() && new Date(b.endDate) >= new Date())} categories={categories} currency={currency} />
				<FutureProjection transactions={transactions} currentBalance={calculatedData.totalAssets} currency={currency} />
			</div>
			<TransactionList title="Recent Transactions" transactions={transactions.slice(0, 5)} txModalControls={txModalControls} accounts={accounts} categories={categories} currency={currency} />
		</div>
	);
};

export default DashboardPage;
