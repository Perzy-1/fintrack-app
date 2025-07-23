import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Card from '../common/Card';
import { formatCurrency } from '../../lib/utils';

const SpendingAnalysis = ({ transactions, budget, categories, currency }) => {
	const analysisData = useMemo(() => {
		if (!budget) return [];
		const expensesByCategory = transactions
			.filter((tx) => tx.type === "expense" && tx.date >= budget.startDate && tx.date <= budget.endDate)
			.reduce((acc, tx) => {
				acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
				return acc;
			}, {});
		return Object.keys(budget.categories).map((category) => {
			const categoryInfo = categories.expense ? categories.expense[category] : null;
			return { name: category, spent: expensesByCategory[category] || 0, budget: budget.categories[category], fill: categoryInfo?.color || "#8884d8" };
		});
	}, [transactions, budget, categories]);

	if (!budget) return (
		<Card>
			<h2 className="text-lg font-semibold mb-4">Spending Analysis</h2>
			<p>No active budget for the current period.</p>
		</Card>
	);

	return (
		<Card>
			<h2 className="text-lg font-semibold mb-4">Spending Analysis: {budget.name}</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={analysisData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" tick={{ fontSize: 12 }} />
					<YAxis tickFormatter={(value) => formatCurrency(value, currency).replace(/(\.00$)/, "")} />
					<Tooltip formatter={(value) => formatCurrency(value, currency)} />
					<Legend />
					<Bar dataKey="budget" name="Budget" fill="#e2e8f0" stackId="a" />
					<Bar dataKey="spent" name="Spent" stackId="a">
						{analysisData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
};

export default SpendingAnalysis;
