import React, { useState, useMemo } from 'react';
import Card from '../components/common/Card';
import AccountItem from '../components/accounts/AccountItem';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const AccountsPage = ({ finTrackData, accountModalControls, navigate }) => {
	const { accounts, transactions, currency, handleDeleteAccount } = finTrackData;
	const [deleteConfirm, setDeleteConfirm] = useState(null);

	const { assetAccounts, liabilityAccounts, totalAssets, totalLiabilities, loanAccounts } = useMemo(() => {
		const assetTypes = ["Debit Card", "Credit Card", "Savings", "Cash"];
		const assetAccounts = accounts.filter((acc) => assetTypes.includes(acc.type));
		const liabilityAccounts = accounts.filter((acc) => acc.type === "Liability");
		const loanAccounts = accounts.filter((acc) => acc.type === "Loan");
		const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.balance, 0) + loanAccounts.reduce((sum, acc) => sum + acc.balance, 0);
		const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0);
		return { assetAccounts, liabilityAccounts, totalAssets, totalLiabilities, loanAccounts };
	}, [accounts]);

	const handleDeleteRequest = (accountId) => {
		const account = accounts.find((a) => a.id === accountId);
		setDeleteConfirm({ isOpen: true, title: "Delete Account", message: `Are you sure you want to delete the "${account?.name}" account? This action cannot be undone.`, onConfirm: () => { handleDeleteAccount(accountId); setDeleteConfirm(null); } });
	};

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card>
				<h3 className="text-base md:text-lg font-semibold mb-2 flex justify-between items-center">
					<span>Assets & Loans</span>
					<span className="text-sm md:text-base font-bold text-green-500">{formatCurrency(totalAssets, currency)}</span>
				</h3>
				<div className="divide-y divide-gray-200 dark:divide-gray-700">
					{assetAccounts.map((account) => (<AccountItem key={account.id} account={account} transactions={transactions} accountModalControls={accountModalControls} currency={currency} onDelete={handleDeleteRequest} navigate={navigate} />))}
					{loanAccounts.map((account) => (<AccountItem key={account.id} account={account} transactions={transactions} accountModalControls={accountModalControls} currency={currency} onDelete={handleDeleteRequest} navigate={navigate} />))}
				</div>
			</Card>
			<Card>
				<h3 className="text-base md:text-lg font-semibold mb-2 flex justify-between items-center">
					<span>Liabilities</span>
					<span className="text-sm md:text-base font-bold text-red-500">{formatCurrency(totalLiabilities, currency)}</span>
				</h3>
				<div className="divide-y divide-gray-200 dark:divide-gray-700">
					{liabilityAccounts.map((account) => (<AccountItem key={account.id} account={account} transactions={transactions} accountModalControls={accountModalControls} currency={currency} onDelete={handleDeleteRequest} navigate={navigate} />))}
				</div>
			</Card>
			<button type="button" onClick={() => accountModalControls.open()} className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Plus size={18} /> Add Account</button>
			{deleteConfirm && (<ConfirmationModal {...deleteConfirm} onClose={() => setDeleteConfirm(null)} />)}
		</div>
	);
};

export default AccountsPage;
