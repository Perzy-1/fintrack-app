#!/bin/bash

# --- Automated Fix Script for FinTrack App ---
# This script corrects the loan balance calculation and payment schedule
# generation in the LoanDetailPage component.

# --- Helper Functions ---
function create_file {
  # Create directory if it doesn't exist
  mkdir -p "$(dirname "$1")"
  # Create the file with the content
  cat > "$1"
}

# --- Main Execution ---
echo "Starting the fix process for the Loan Detail Page..."

# 1. Update src/pages/LoanDetailPage.jsx with corrected logic
echo "Fixing src/pages/LoanDetailPage.jsx..."
create_file src/pages/LoanDetailPage.jsx <<'EOF'
import React, { useMemo } from 'react';
import Card from '../components/common/Card';
import TransactionList from '../components/transactions/TransactionList';
import { formatCurrency, formatDateForInput } from '../lib/utils';
import { AlertTriangle } from 'lucide-react';

const LoanDetailPage = ({ account, finTrackData, txModalControls }) => {
	const { transactions, accounts, categories, currency } = finTrackData;

	const {
		relatedTransactions,
		totalPaid,
		paymentSchedule,
		interestPerMonth,
		totalInterest,
	} = useMemo(() => {
		const related = transactions.filter(
			(tx) =>
				tx.type === "income" &&
				tx.category === "Loan Collection" &&
				tx.accountId === account.id,
		);

		const totalPaid = related.reduce((sum, tx) => sum + tx.amount, 0);

		const schedule = [];
		const interestRate = parseFloat(account.interestRate) || 0;
		const principal = account.balance;
		
		const monthlyInterest = (principal * interestRate) / 100;
		let totalInterestPayable = 0;

		if (account.interestCollectionFrequency === "Monthly" && account.dueDate) {
			let startDate = new Date(account.id.split("-")[1]);
			let currentDate = new Date(startDate);
			const finalDueDate = new Date(account.dueDate);

			while (currentDate < finalDueDate) {
				currentDate.setMonth(currentDate.getMonth() + 1);
				if (currentDate <= finalDueDate) {
					schedule.push({
						date: formatDateForInput(new Date(currentDate)),
						amount: monthlyInterest,
					});
				}
			}
			totalInterestPayable = monthlyInterest * schedule.length;
		}

		return {
			relatedTransactions: related,
			totalPaid,
			paymentSchedule: schedule,
			interestPerMonth: monthlyInterest,
			totalInterest: totalInterestPayable,
		};
	}, [account, transactions]);

	const remainingBalance = (account.balance + totalInterest) - totalPaid;

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card>
				<h3 className="text-lg font-semibold mb-4">Loan Summary</h3>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="font-semibold text-gray-500">Principal Lent:</div><div>{formatCurrency(account.balance, currency)}</div>
					<div className="font-semibold text-gray-500">Interest Rate:</div><div>{account.interestRate || "0"}%</div>
					<div className="font-semibold text-gray-500">Interest Per Month:</div><div>{formatCurrency(interestPerMonth, currency)}</div>
					<div className="font-semibold text-gray-500">Total Interest Payable:</div><div>{formatCurrency(totalInterest, currency)}</div>
					<div className="font-semibold text-gray-500">Total Paid Back:</div><div className="text-green-500">{formatCurrency(totalPaid, currency)}</div>
					<div className="font-semibold text-gray-500">Remaining Balance:</div><div className="font-bold">{formatCurrency(remainingBalance, currency)}</div>
					<div className="font-semibold text-gray-500">Collection Schedule:</div><div>{account.interestCollectionFrequency}</div>
					<div className="font-semibold text-gray-500">Final Due Date:</div><div>{account.dueDate}</div>
				</div>
			</Card>

			<Card>
				<h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>
				{paymentSchedule.length > 0 ? (
					<div className="space-y-2 max-h-60 overflow-y-auto">
						{paymentSchedule.map((payment, index) => (
							<div key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
								<span>{payment.date}</span>
								<span className="font-semibold">{formatCurrency(payment.amount, currency)}</span>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-gray-500">No payment schedule available for this loan type.</p>
				)}
				{account.overdueAmount > 0 && (
					<div className="font-semibold text-yellow-500 text-center pt-2 border-t mt-2">
						<AlertTriangle className="inline-block mr-2" size={16} />
						Overdue Amount: {formatCurrency(account.overdueAmount, currency)}
					</div>
				)}
			</Card>

			<TransactionList title="Payment History" transactions={relatedTransactions} txModalControls={txModalControls} accounts={accounts} categories={categories} currency={currency} />
		</div>
	);
};

export default LoanDetailPage;
EOF

echo "Fix script complete!"
echo "The Loan Detail Page has been fixed with accurate calculations and a full payment schedule."
echo "Please restart your development server to see the changes."
