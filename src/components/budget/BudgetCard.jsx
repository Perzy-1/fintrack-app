import React, { useMemo } from 'react';
import { Copy, Edit, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import CategoryIcon from '../common/CategoryIcon';
import { formatCurrency } from '../../lib/utils';

const BudgetCard = ({ budget, transactions, categories, budgetModalControls, currency, budgetDisplay }) => {
	const budgetData = useMemo(() => {
		const relevantTx = transactions.filter((tx) => tx.type === "expense" && tx.date >= budget.startDate && tx.date <= budget.endDate && budget.categories[tx.category]);
		const spentByCategory = relevantTx.reduce((acc, tx) => {
			acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
			return acc;
		}, {});
		const totalBudget = Object.values(budget.categories).reduce((sum, limit) => sum + limit, 0);
		const totalSpent = Object.values(spentByCategory).reduce((sum, spent) => sum + spent, 0);
		return { spentByCategory, totalBudget, totalSpent };
	}, [budget, transactions]);

	const overallPercentage = budgetData.totalBudget > 0 ? (budgetData.totalSpent / budgetData.totalBudget) * 100 : 0;

	const renderProgressText = (spent, limit) => {
		const remaining = limit - spent;
		const ratio = `${formatCurrency(spent, currency)} / ${formatCurrency(limit, currency)}`;
		const remainingText = `${formatCurrency(remaining, currency)} remaining`;
		if (budgetDisplay === "ratio") return <span className="text-xs">{ratio}</span>;
		if (budgetDisplay === "remaining") return <span className="text-xs">{remainingText}</span>;
		return (
			<div className="flex flex-col items-end">
				<span className="text-xs">{ratio}</span>
				<span className="text-xs text-gray-500">{remainingText}</span>
			</div>
		);
	};

	return (
		<Card>
			<div className="flex justify-between items-start">
				<div>
					<h3 className="text-lg font-semibold mb-2">{budget.name}</h3>
					<p className="text-sm text-gray-500 mb-4">{new Date(budget.startDate + "T00:00:00").toLocaleDateString()} - {new Date(budget.endDate + "T00:00:00").toLocaleDateString()}</p>
				</div>
				<div className="flex gap-2">
					<button type="button" onClick={() => budgetModalControls.duplicate(budget.id)} title="Duplicate Budget"><Copy className="w-5 h-5 text-gray-500" /></button>
					<button type="button" onClick={() => budgetModalControls.edit(budget)} title="Edit Budget"><Edit className="w-5 h-5 text-gray-500" /></button>
					<button type="button" onClick={() => budgetModalControls.delete(budget.id)} title="Delete Budget"><Trash2 className="w-5 h-5 text-red-500" /></button>
				</div>
			</div>
			<div className="mb-4">
				<div className="flex justify-between mb-1">
					<span className="text-sm font-medium">Overall Progress</span>
					<div className="text-right">{renderProgressText(budgetData.totalSpent, budgetData.totalBudget)}</div>
				</div>
				<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-1">
					<div className="bg-indigo-600 h-4 rounded-full" style={{ width: `${Math.min(overallPercentage, 100)}%` }}></div>
				</div>
			</div>
			<div className="space-y-3">
				{Object.entries(budget.categories).map(([cat, limit]) => {
					const spent = budgetData.spentByCategory[cat] || 0;
					const percentage = limit > 0 ? (spent / limit) * 100 : 0;
					const categoryInfo = (categories.expense && categories.expense[cat]) || {};
					return (
						<div key={cat}>
							<div className="flex justify-between items-center mb-1">
								<div className="flex items-center">
									<CategoryIcon name={categoryInfo.icon} type={categoryInfo.type} className="w-4 h-4 mr-2" style={{ color: categoryInfo.color }} />
									<span className="text-sm font-medium">{cat}</span>
								</div>
								<div className="text-right">{renderProgressText(spent, limit)}</div>
							</div>
							<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div className="h-2 rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: categoryInfo.color || "#8B5CF6" }}></div>
							</div>
						</div>
					);
				})}
			</div>
		</Card>
	);
};

export default BudgetCard;
