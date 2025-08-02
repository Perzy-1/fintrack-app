import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import TransactionList from '../components/transactions/TransactionList';
import { formatCurrency } from '../lib/utils';
import { AlertTriangle } from 'lucide-react';

const LoanDetailPage = ({ accounts, transactions, categories, currency, txModalControls }) => {
    const { id } = useParams();

    // Add a guard clause to handle cases where accounts data is not yet available.
    if (!accounts || accounts.length === 0) {
        return <div className="p-4">Loading loan data...</div>;
    }

    const account = accounts.find((acc) => acc.id === parseInt(id));

    const {
        relatedTransactions,
        totalPaid,
        remainingBalance,
        totalInterest,
        paymentSchedule,
    } = useMemo(() => {
        if (!account) {
            return {
                relatedTransactions: [],
                totalPaid: 0,
                remainingBalance: 0,
                totalInterest: 0,
                paymentSchedule: [],
            };
        }

        // Filter for loan collection transactions (assuming loan is an asset)
        const related = transactions.filter(
            (tx) =>
                tx.accountId === account.id &&
                tx.type === 'income' &&
                tx.category === 'Loan Collection'
        );

        const totalPaid = related.reduce((sum, tx) => sum + tx.amount, 0);

        const principal = account.balance;
        const interestRate = parseFloat(account.interestRate) / 100;
        const startDate = new Date(account.createdAt);
        const endDate = new Date(account.dueDate);

        // Calculate term in years for simple interest calculation
        const termInMs = endDate.getTime() - startDate.getTime();
        const termInYears = termInMs > 0 ? termInMs / (1000 * 60 * 60 * 24 * 365.25) : 0;

        // Normalize interest rate to an annual rate
        const annualRate = account.interestRateType === 'per month'
            ? interestRate * 12
            : interestRate;

        // Calculate total simple interest over the entire term
        const calculatedTotalInterest = principal * annualRate * termInYears;

        // Calculate remaining balance
        const calculatedRemainingBalance = (principal + calculatedTotalInterest) - totalPaid;

        // Generate payment schedule
        const schedule = [];
        const frequency = account.interestCollectionFrequency;

        if (frequency && endDate > startDate) {
            let numPayments = 0;
            if (frequency === 'monthly') {
                numPayments = Math.ceil(termInYears * 12);
            } else if (frequency === 'quarterly') {
                numPayments = Math.ceil(termInYears * 4);
            } else if (frequency === 'annually') {
                numPayments = Math.ceil(termInYears);
            }

            if (numPayments > 0) {
                const paymentAmount = (principal + calculatedTotalInterest) / numPayments;
                let paymentDate = new Date(startDate);

                for (let i = 0; i < numPayments; i++) {
                    if (frequency === 'monthly') {
                        paymentDate.setMonth(paymentDate.getMonth() + 1);
                    } else if (frequency === 'quarterly') {
                        paymentDate.setMonth(paymentDate.getMonth() + 3);
                    } else if (frequency === 'annually') {
                        paymentDate.setFullYear(paymentDate.getFullYear() + 1);
                    }

                    const dateForSchedule = (i === numPayments - 1) ? new Date(endDate) : new Date(paymentDate);

                    schedule.push({
                        date: dateForSchedule.toLocaleDateString(),
                        amount: paymentAmount,
                    });
                }
            }
        }

        return {
            relatedTransactions: related,
            totalPaid,
            remainingBalance: calculatedRemainingBalance,
            totalInterest: calculatedTotalInterest,
            paymentSchedule: schedule,
        };
    }, [account, transactions]);

    if (!account) {
        return <div className="p-4">Loan account not found.</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-2xl font-bold mb-4">{account.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-lg">
                    <div>
                        <div className="font-semibold text-gray-500 dark:text-gray-400">Remaining Balance:</div>
                        <div className="text-2xl font-bold">{formatCurrency(remainingBalance, currency)}</div>
                    </div>
                    <div>
                        <div className="font-semibold text-gray-500 dark:text-gray-400">Total Paid:</div>
                        <div className="text-2xl font-bold text-green-500">{formatCurrency(totalPaid, currency)}</div>
                    </div>
                     <div>
                        <div className="font-semibold text-gray-500 dark:text-gray-400">Total Interest:</div>
                        <div className="text-2xl font-bold">{formatCurrency(totalInterest, currency)}</div>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-semibold mb-2">Loan Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="font-semibold text-gray-500">Original Balance:</div><div>{formatCurrency(account.balance, currency)}</div>
                    <div className="font-semibold text-gray-500">Interest Rate:</div><div>{account.interestRate}% {account.interestRateType}</div>
                    <div className="font-semibold text-gray-500">Payment Frequency:</div><div>{account.interestCollectionFrequency}</div>
                    <div className="font-semibold text-gray-500">Final Due Date:</div><div>{new Date(account.dueDate).toLocaleDateString()}</div>
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
