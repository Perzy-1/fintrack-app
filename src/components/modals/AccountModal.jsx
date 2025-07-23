import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Card from '../common/Card';
import CalculatorInput from '../common/CalculatorInput';
import ConfirmationModal from '../common/ConfirmationModal';
import { formatCurrency, formatDateForInput } from '../../lib/utils';

const AccountModal = ({ isOpen, onClose, onSave, onDelete, accountToEdit, onSaveTransaction, onError, accounts }) => {
	const [name, setName] = useState("");
	const [type, setType] = useState("Debit Card");
	const [balance, setBalance] = useState("");
	const [interestRate, setInterestRate] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [sourceAccountId, setSourceAccountId] = useState(accounts.find((a) => a.type !== "Loan" && a.type !== "Liability")?.id || "");
	const [interestCollectionFrequency, setInterestCollectionFrequency] = useState("Monthly");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [correctionData, setCorrectionData] = useState(null);
	const isEditMode = !!accountToEdit;

	useEffect(() => {
		if (isOpen) {
			if (isEditMode) {
				setName(accountToEdit.name);
				setType(accountToEdit.type);
				setBalance(accountToEdit.balance.toFixed(2));
				setInterestRate(accountToEdit.interestRate || "");
				setDueDate(accountToEdit.dueDate || "");
				setInterestCollectionFrequency(accountToEdit.interestCollectionFrequency || "Monthly");
			} else {
				setName("");
				setType("Debit Card");
				setBalance("");
				setInterestRate("");
				setDueDate("");
				setInterestCollectionFrequency("Monthly");
			}
			setShowDeleteConfirm(false);
			setCorrectionData(null);
		}
	}, [isOpen, accountToEdit]);

	const handleConfirmCorrection = () => {
		if (!correctionData) return;
		const { difference } = correctionData;
		const isPositive = difference > 0;
		const correctionTx = {
			id: `tx-${Date.now()}`,
			accountId: accountToEdit.id,
			amount: Math.abs(difference),
			date: formatDateForInput(new Date()),
			description: "Manual balance correction",
			type: isPositive ? "income" : "expense",
			category: isPositive ? "Balance Adjustment" : "Balance Correction",
		};
		onSaveTransaction(correctionTx);
		onClose();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name) { onError("Account name is required."); return; }
		if (balance === "") { onError("Balance is required."); return; }
		const newBalance = parseFloat(balance);
		const baseAccountData = { name, type, interestRate, dueDate };
		if (type === "Loan") {
			baseAccountData.interestCollectionFrequency = interestCollectionFrequency;
		}
		if (isEditMode) {
			const balanceDifference = newBalance - accountToEdit.balance;
			if (Math.abs(balanceDifference) > 0.001) {
				setCorrectionData({ difference: balanceDifference });
				return;
			}
			onSave({ ...accountToEdit, ...baseAccountData, balance: accountToEdit.balance });
			onClose();
		} else {
			const newAccount = { ...baseAccountData, id: `acc-${Date.now()}`, balance: newBalance, lastProcessedDate: null, overdueAmount: 0 };
			onSave(newAccount, sourceAccountId);
			onClose();
		}
	};

	const handleDelete = () => {
		onDelete(accountToEdit.id);
		setShowDeleteConfirm(false);
		onClose();
	};

	if (!isOpen) return null;
	const getBalanceLabel = () => {
		switch (type) {
			case "Liability": return "Amount Owed";
			case "Loan": return "Amount Lent";
			default: return isEditMode ? "Corrected Balance" : "Initial Balance";
		}
	};
	const showExtraFields = type === "Loan" || type === "Liability";

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<Card className="w-full max-w-md">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-lg font-semibold">{isEditMode ? "Edit Account" : "Add Account"}</h2>
					<button type="button" onClick={onClose}><X className="h-6 w-6" /></button>
				</div>
				{!correctionData ? (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label htmlFor="acc-name">Account Name</label>
							<input id="acc-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
						</div>
						<div>
							<label htmlFor="acc-type">Account Type</label>
							<select id="acc-type" value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
								<option>Debit Card</option><option>Credit Card</option><option>Savings</option><option>Cash</option><option>Loan</option><option>Liability</option>
							</select>
						</div>
						{!isEditMode && type === "Loan" && (
							<div>
								<label htmlFor="source-account">Source Account</label>
								<select id="source-account" value={sourceAccountId} onChange={(e) => setSourceAccountId(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
									{accounts.filter((a) => a.type !== "Loan" && a.type !== "Liability").map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
								</select>
							</div>
						)}
						<div>
							<label htmlFor="acc-balance">{getBalanceLabel()}</label>
							<CalculatorInput value={balance} onChange={(e) => setBalance(e.target.value)} step="0.01" />
						</div>
						{showExtraFields && (
							<>
								<div>
									<label htmlFor="acc-interest">Interest Rate (%)</label>
									<input id="acc-interest" type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" placeholder="e.g., 5" />
								</div>
								{type === "Loan" && (
									<div>
										<label htmlFor="acc-collection-freq">Interest Collection</label>
										<select id="acc-collection-freq" value={interestCollectionFrequency} onChange={(e) => setInterestCollectionFrequency(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
											<option value="Daily">Daily</option><option value="Monthly">Monthly</option><option value="Yearly">Yearly</option><option value="End of Term">End of Term (with capital)</option>
										</select>
									</div>
								)}
								<div>
									<label htmlFor="acc-due-date">Due Date</label>
									<input id="acc-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
								</div>
							</>
						)}
						<div className="flex justify-between items-center pt-4">
							{isEditMode && (<button type="button" onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Delete</button>)}
							<div className="flex-grow" />
							<button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">{isEditMode ? "Save Changes" : "Add Account"}</button>
						</div>
					</form>
				) : (
					<div>
						<h3 className="text-lg font-semibold">Confirm Balance Change</h3>
						<p className="my-4">A difference of <span className={correctionData.difference > 0 ? "text-green-500" : "text-red-500"}>{formatCurrency(correctionData.difference)}</span> was detected. A correction transaction will be created to align the balance.</p>
						<div className="flex justify-end space-x-3">
							<button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600">Cancel</button>
							<button onClick={handleConfirmCorrection} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Confirm Correction</button>
						</div>
					</div>
				)}
			</Card>
			<ConfirmationModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} title="Delete Account" message={`Are you sure you want to delete the "${accountToEdit?.name}" account? This action cannot be undone.`} />
		</div>
	);
};

export default AccountModal;
