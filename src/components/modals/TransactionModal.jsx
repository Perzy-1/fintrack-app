import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import Card from '../common/Card';
import CalculatorInput from '../common/CalculatorInput';
import { formatDateForInput } from '../../lib/utils';

const TransactionModal = ({ isOpen, onClose, onSave, transactionToEdit, accounts, categories = { income: {}, expense: {} }, onError, isCorrectionMode }) => {
        const safeCategories = useMemo(() => ({ income: categories.income || {}, expense: categories.expense || {} }), [categories]);
        const [type, setType] = useState("expense");
        const [accountId, setAccountId] = useState(accounts[0]?.id || "");
        const [amount, setAmount] = useState("");
        const [category, setCategory] = useState(Object.keys(safeCategories.expense)[0] || "");
	const [date, setDate] = useState(formatDateForInput(new Date()));
	const [description, setDescription] = useState("");
	const [fromAccount, setFromAccount] = useState(accounts[0]?.id || "");
	const [toAccount, setToAccount] = useState(accounts[1]?.id || "");
	const [fee, setFee] = useState("");
    const [interestAmount, setInterestAmount] = useState("");
	const isEditMode = !!transactionToEdit;

	const availableAccounts = useMemo(() => {
		if (type === "expense" && category === "Debt Payment") return accounts.filter((acc) => acc.type === "Liability");
		if (type === "income" && category === "Loan Collection") return accounts.filter((acc) => acc.type === "Loan");
		return accounts.filter((acc) => acc.type !== "Loan" && acc.type !== "Liability");
	}, [accounts, type, category]);

	const transferAccounts = useMemo(() => accounts.filter((acc) => acc.type !== "Loan" && acc.type !== "Liability"), [accounts]);

	useEffect(() => {
                if (isOpen) {
                        const defaults = { type: "expense", accountId: availableAccounts[0]?.id || "", amount: "", category: Object.keys(safeCategories.expense)[0] || "", date: formatDateForInput(new Date()), description: "", fromAccount: transferAccounts[0]?.id || "", toAccount: transferAccounts[1]?.id || "", fee: "", interestAmount: "" };
			const initial = isEditMode ? { ...defaults, ...transactionToEdit, amount: transactionToEdit.amount.toString(), fee: transactionToEdit.fee?.toString() || "", interestAmount: transactionToEdit.interestAmount?.toString() || "" } : defaults;
			setType(initial.type);
			setAccountId(initial.accountId);
			setAmount(initial.amount);
			setCategory(initial.category);
			setDate(initial.date);
			setDescription(initial.description);
			setFromAccount(initial.from || initial.fromAccount);
			setToAccount(initial.to || initial.toAccount);
			setFee(initial.fee);
            setInterestAmount(initial.interestAmount);
		}
        }, [isOpen, isEditMode, transactionToEdit, accounts, categories, availableAccounts, transferAccounts, safeCategories]);

        useEffect(() => {
                if (isCorrectionMode) return;
                if (type === "income") setCategory(Object.keys((categories && categories.income) || {})[0] || "");
                else setCategory(Object.keys((categories && categories.expense) || {})[0] || "");
        }, [type, categories, isCorrectionMode]);

	useEffect(() => {
		if (!availableAccounts.find((a) => a.id === accountId)) setAccountId(availableAccounts[0]?.id || "");
	}, [availableAccounts, accountId]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!amount || parseFloat(amount) <= 0) { onError("Please enter a valid amount."); return; }
		const baseTx = { id: isEditMode ? transactionToEdit.id : `tx-${Date.now()}`, amount: parseFloat(amount), date, description, type };
		let newTx;
		if (type === "transfer") {
			if (fromAccount === toAccount) { onError("Cannot transfer to the same account."); return; }
			newTx = { ...baseTx, from: fromAccount, to: toAccount };
			if (fee) newTx.fee = parseFloat(fee);
		} else {
			newTx = { ...baseTx, accountId: accountId, category: category };
            if (category === "Loan Collection" && interestAmount) {
                newTx.interestAmount = parseFloat(interestAmount);
            }
		}
		onSave(newTx);
		onClose();
	};

	if (!isOpen) return null;
        const categoryOptions = type === "income" ? safeCategories.income : safeCategories.expense;
	const typeOptions = [{ label: "Income", value: "income" }, { label: "Expense", value: "expense" }, { label: "Transfer", value: "transfer" }];

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<Card className="w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">{isEditMode ? "Edit" : "Add"} Transaction</h2>
					<button type="button" onClick={onClose}><X className="h-6 w-6" /></button>
				</div>
				{!isCorrectionMode && (
					<div className="flex justify-center mb-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
						{typeOptions.map((opt) => (<button key={opt.value} onClick={() => setType(opt.value)} className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${type === opt.value ? "bg-indigo-600 text-white" : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>{opt.label}</button>))}
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 gap-4">
						<div className="flex items-center gap-4">
							<label htmlFor="tx-date" className="w-24">Date</label>
							<input id="tx-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
						</div>
						<div className="flex items-center gap-4">
							<label htmlFor="tx-amount" className="w-24">Amount</label>
							<CalculatorInput id="tx-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
						</div>
						{type === "transfer" && !isCorrectionMode ? (
							<>
								{/* Transfer fields */}
							</>
						) : (
							<>
								<div className="flex items-center gap-4">
									<label htmlFor="tx-category" className="w-24">Category</label>
									{isCorrectionMode ? (
										<div className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:border-gray-600">{category}</div>
									) : (
										<select id="tx-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
											{Object.keys(categoryOptions).map((c) => (<option key={c} value={c}>{c}</option>))}
										</select>
									)}
								</div>
								<div className="flex items-center gap-4">
									<label htmlFor="tx-account" className="w-24">Account</label>
									<select id="tx-account" value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
										{availableAccounts.length > 0 ? (availableAccounts.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))) : (<option disabled>No compatible accounts</option>)}
									</select>
								</div>
                                {category === "Loan Collection" && (
                                    <div className="flex items-center gap-4">
                                        <label htmlFor="tx-interest" className="w-24">Interest Paid</label>
                                        <CalculatorInput id="tx-interest" value={interestAmount} onChange={(e) => setInterestAmount(e.target.value)} placeholder="0.00" />
                                    </div>
                                )}
							</>
						)}
						<div className="flex items-center gap-4">
							<label htmlFor="tx-desc" className="w-24">Note</label>
							<input id="tx-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
						</div>
					</div>
					<button type="submit" className="w-full bg-indigo-600 text-white font-semibold p-3 rounded-lg hover:bg-indigo-700 mt-6">{isEditMode ? "Save Changes" : "Add Transaction"}</button>
				</form>
			</Card>
		</div>
	);
};

export default TransactionModal;
