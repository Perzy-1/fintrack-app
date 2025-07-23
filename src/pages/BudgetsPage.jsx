import React from 'react';
import BudgetCard from '../components/budget/BudgetCard';
import { Plus } from 'lucide-react';

const BudgetsPage = ({ finTrackData, budgetModalControls, budgetDisplay }) => (
	<div className="p-4 md:p-6 space-y-6">
		{finTrackData.budgets.map((budget) => (<BudgetCard key={budget.id} budget={budget} transactions={finTrackData.transactions} categories={finTrackData.categories} budgetModalControls={budgetModalControls} currency={finTrackData.currency} budgetDisplay={budgetDisplay} />))}
		<button type="button" onClick={() => budgetModalControls.open()} className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Plus size={18} /> Add Budget</button>
	</div>
);

export default BudgetsPage;
