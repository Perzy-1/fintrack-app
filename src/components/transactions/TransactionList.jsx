import React, { useMemo } from 'react';
import Card from '../common/Card';
import TransactionItem from './TransactionItem';
import { formatDateHeader } from '../../lib/utils';

const TransactionList = ({ title, transactions, txModalControls, accounts, categories, currency, contextAccountId }) => {
	const groupedTransactions = useMemo(() => {
		return transactions.reduce((acc, tx) => {
			const date = tx.date;
			if (!acc[date]) acc[date] = [];
			acc[date].push(tx);
			return acc;
		}, {});
	}, [transactions]);

	return (
		<Card>
			<h2 className="text-lg font-semibold mb-4">{title}</h2>
			<div className="space-y-4">
				{transactions.length > 0 ? (
					Object.entries(groupedTransactions).map(([date, txs]) => (
						<div key={date}>
							<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-md sticky top-[calc(4rem+env(safe-area-inset-top))]">{formatDateHeader(date)}</h3>
							<div className="space-y-2 mt-2">
								{txs.map((tx) => (<TransactionItem key={tx.id} tx={tx} txModalControls={txModalControls} accounts={accounts} categories={categories} currency={currency} contextAccountId={contextAccountId} />))}
							</div>
						</div>
					))
				) : (
					<p className="text-center text-gray-500 py-8">No transactions to show.</p>
				)}
			</div>
		</Card>
	);
};

export default TransactionList;
