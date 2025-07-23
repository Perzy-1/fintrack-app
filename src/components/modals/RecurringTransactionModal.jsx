import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Card from '../common/Card';
import CalculatorInput from '../common/CalculatorInput';
import { formatDateForInput } from '../../lib/utils';

const RecurringTransactionModal = ({ isOpen, onClose, onSave, transactionToEdit, accounts, categories, onError }) => {
	const [type, setType] = useState("expense");
	const [accountId, setAccountId] = useState(accounts[0]?.id || "");
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState(Object.keys(categories.expense)[0] || "");
	const [description, setDescription] = useState("");
	const [frequency, setFrequency] = useState("Monthly");
	const [startDate, setStartDate] = useState(formatDateForInput(new Date()));
	const isEditMode = !!transactionToEdit;

	useEffect(() => {
		if (isOpen) {
			const defaults = { type: "expense", accountId: accounts[0]?.id || "", amount: "", category: Object.keys(categories.expense)[0] || "", description: "", frequency: "Monthly", startDate: formatDateForInput(new Date()), lastProcessed: null };
			const initial = isEditMode ? { ...defaults, ...transactionToEdit, amount: transactionToEdit.amount.toString() } : defaults;
			setType(initial.type);
			setAccountId(initial.accountId);
			setAmount(initial.amount);
			setCategory(initial.category);
			setDescription(initial.description);
			setFrequency(initial.frequency);
			setStartDate(initial.startDate);
		}
	}, [isOpen, isEditMode, transactionToEdit, accounts, categories]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!amount || parseFloat(amount) <= 0) { onError("Please enter a valid amount."); return; }
		if (!description) { onError("Please enter a description."); return; }
		const newRecTx = { id: isEditMode ? transactionToEdit.id : `rec-tx-${Date.now()}`, amount: parseFloat(amount), description, type, accountId, category, frequency, startDate, lastProcessed: isEditMode ? transactionToEdit.lastProcessed : null };
		onSave(newRecTx);
		onClose();
	};

	if (!isOpen) return null;
	const categoryOptions = type === "income" ? categories.income : categories.expense;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<Card className="w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">{isEditMode ? "Edit" : "Add"} Recurring Transaction</h2>
					<button type="button" onClick={onClose}><X className="h-6 w-6" /></button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex items-center gap-4">
						<label className="w-24">Type</label>
						<div className="flex-grow flex justify-center border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
							<button type="button" onClick={() => setType("income")} className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${type === "income" ? "bg-green-600 text-white" : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>Income</button>
							<button type="button" onClick={() => setType("expense")} className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${type === "expense" ? "bg-red-600 text-white" : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>Expense</button>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<label htmlFor="rec-desc" className="w-24">Description</label>
						<input id="rec-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
					</div>
					<div className="flex items-center gap-4">
						<label htmlFor="rec-amount" className="w-24">Amount</label>
						<CalculatorInput id="rec-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
					</div>
					<div className="flex items-center gap-4">
						<label htmlFor="rec-category" className="w-24">Category</label>
						<select id="rec-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							{Object.keys(categoryOptions).map((c) => (<option key={c} value={c}>{c}</option>))}
						</select>
					</div>
					<div className="flex items-center gap-4">
						<label htmlFor="rec-account" className="w-24">Account</label>
						<select id="rec-account" value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							{accounts.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
						</select>
					</div>
					<div className="flex items-center gap-4">
						<label htmlFor="rec-frequency" className="w-24">Frequency</label>
						<select id="rec-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							<option value="Daily">Daily</option><option value="Weekly">Weekly</option><option value="Monthly">Monthly</option><option value="Annually">Annually</option>
						</select>
					</div>
					<div className="flex items-center gap-4">
						<label htmlFor="rec-start-date" className="w-24">Start Date</label>
						<input id="rec-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
					</div>
					<button type="submit" className="w-full bg-indigo-600 text-white font-semibold p-3 rounded-lg hover:bg-indigo-700 mt-6">{isEditMode ? "Save Changes" : "Add Recurring"}</button>
				</form>
			</Card>
		</div>
	);
};

export default RecurringTransactionModal;
