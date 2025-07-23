import React, { useMemo } from 'react';
import Card from '../common/Card';
import { formatCurrency } from '../../lib/utils';

const FutureProjection = ({ transactions, currentBalance, currency }) => {
	const projection = useMemo(() => {
		const today = new Date();
		const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
		const recentExpenses = transactions.filter((t) => new Date(t.date) >= thirtyDaysAgo && t.type === "expense");
		if (recentExpenses.length === 0) return { weekly: 0, monthly: 0, endOfMonthBalance: currentBalance };
		const totalSpent = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
		const dailyAvg = totalSpent / 30;
		const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
		const daysRemaining = daysInMonth - today.getDate();
		const weeklyProjection = dailyAvg * 7;
		const restOfMonthProjection = dailyAvg * daysRemaining;
		const endOfMonthBalance = currentBalance - restOfMonthProjection;
		return { weekly: weeklyProjection, monthly: restOfMonthProjection, endOfMonthBalance };
	}, [transactions, currentBalance]);

	return (
		<Card>
			<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Future Projection</h2>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-500">Est. spending next 7 days:</span>
					<span className="font-semibold">~{formatCurrency(projection.weekly, currency)}</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-500">Est. spending rest of month:</span>
					<span className="font-semibold">~{formatCurrency(projection.monthly, currency)}</span>
				</div>
				<div className="border-t dark:border-gray-700 my-2"></div>
				<div className="flex justify-between items-center">
					<span className="font-semibold">Projected End-of-Month Balance:</span>
					<span className={`text-xl font-bold ${projection.endOfMonthBalance >= 0 ? "text-green-500" : "text-red-500"}`}>{formatCurrency(projection.endOfMonthBalance, currency)}</span>
				</div>
			</div>
			<p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">Based on spending over the last 30 days.</p>
		</Card>
	);
};

export default FutureProjection;
