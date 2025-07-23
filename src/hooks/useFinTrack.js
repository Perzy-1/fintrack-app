import { useState, useEffect, useMemo } from 'react';
import { initialData, defaultCategories, STORES, initialNotifications } from '../lib/constants';
import { initDB, validateAndCleanData } from '../lib/db';
import { formatDateForInput, getStartOfMonth, getEndOfMonth } from '../lib/utils';

export const useFinTrack = () => {
	const [accounts, setAccounts] = useState(initialData.accounts);
	const [budgets, setBudgets] = useState(initialData.budgets);
	const [transactions, setTransactions] = useState(initialData.transactions);
	const [categories, setCategories] = useState(initialData.categories);
	const [recurringTransactions, setRecurringTransactions] = useState(initialData.recurringTransactions);
	const [notifications, setNotifications] = useState(initialNotifications);
	const [isDbLoading, setIsDbLoading] = useState(true);

	const sortTransactions = (txs) => txs.sort((a, b) => new Date(b.date) - new Date(a.date));

	const updateStateAndDB = async (storeName, data, setter) => {
		setter(data);
		const db = await initDB();
		const tx = db.transaction(storeName, "readwrite");
		const store = tx.objectStore(storeName);
		await store.clear();
		if (Array.isArray(data)) {
			await Promise.all(data.map((item) => store.put(item)));
		} else {
			await store.put({ id: "main", ...data });
		}
		await tx.done;
	};

	useEffect(() => {
		const loadData = async () => {
			setIsDbLoading(true);
			try {
				const db = await initDB();
				const accountsCount = await db.count("accounts");
				if (accountsCount > 0) {
					const loadedData = {
						accounts: await db.getAll("accounts"),
						transactions: sortTransactions(await db.getAll("transactions")),
						budgets: await db.getAll("budgets"),
						categories: (await db.get("categories", "main")) || defaultCategories,
						recurringTransactions: (await db.getAll("recurringTransactions")) || [],
					};
					const cleanedData = validateAndCleanData(loadedData);
					setAccounts(cleanedData.accounts);
					setTransactions(cleanedData.transactions);
					setBudgets(cleanedData.budgets);
					setCategories(cleanedData.categories);
					setRecurringTransactions(cleanedData.recurringTransactions);
				} else {
					const tx = db.transaction(STORES, "readwrite");
					await Promise.all([
						...initialData.accounts.map((item) => tx.objectStore("accounts").put(item)),
						...initialData.transactions.map((item) => tx.objectStore("transactions").put(item)),
						...initialData.budgets.map((item) => tx.objectStore("budgets").put(item)),
						tx.objectStore("categories").put({ id: "main", ...initialData.categories }),
						...initialData.recurringTransactions.map((item) => tx.objectStore("recurringTransactions").put(item)),
					]);
					await tx.done;
					setAccounts(initialData.accounts);
					setTransactions(sortTransactions(initialData.transactions));
					setBudgets(initialData.budgets);
					setCategories(initialData.categories);
					setRecurringTransactions(initialData.recurringTransactions);
				}
			} catch (error) {
				console.error("Failed to load data from DB:", error);
			} finally {
				setIsDbLoading(false);
			}
		};
		loadData();
	}, []);

	useEffect(() => {
		if (isDbLoading) return;
		const today = new Date();
		const updatedBudgets = budgets.map((budget) => {
			if (budget.period === "Monthly") {
				const endDate = new Date(budget.endDate);
				if (endDate < today && endDate.getMonth() !== today.getMonth()) {
					return { ...budget, startDate: formatDateForInput(getStartOfMonth(today)), endDate: formatDateForInput(getEndOfMonth(today)) };
				}
			}
			return budget;
		});
		if (JSON.stringify(updatedBudgets) !== JSON.stringify(budgets)) {
			updateStateAndDB("budgets", updatedBudgets, setBudgets);
		}
	}, [budgets, isDbLoading]);

	const calculatedData = useMemo(() => {
		const assetTypes = ["Debit Card", "Credit Card", "Savings", "Cash"];
		const totalAssets = accounts.filter((acc) => assetTypes.includes(acc.type)).reduce((sum, acc) => sum + acc.balance, 0);
		const totalLoans = accounts.filter((acc) => acc.type === "Loan").reduce((sum, acc) => sum + acc.balance, 0);
		const totalLiabilities = accounts.filter((acc) => acc.type === "Liability").reduce((sum, acc) => sum + acc.balance, 0);
		const netWorth = totalAssets + totalLoans - totalLiabilities;
		return { totalAssets, totalLoans, totalLiabilities, netWorth };
	}, [accounts]);

	const handleSaveTransaction = async (newTx) => {
		const db = await initDB();
		await db.put("transactions", newTx);
		const allTxs = await db.getAll("transactions");
		setTransactions(sortTransactions(allTxs));
		const tx = db.transaction("accounts", "readwrite");
		if (newTx.type === "transfer") {
			const fromAccount = await tx.store.get(newTx.from);
			const toAccount = await tx.store.get(newTx.to);
			await tx.store.put({ ...fromAccount, balance: fromAccount.balance - newTx.amount - (newTx.fee || 0) });
			await tx.store.put({ ...toAccount, balance: toAccount.balance + newTx.amount });
		} else {
			const account = await tx.store.get(newTx.accountId);
			const newBalance = newTx.type === "income" ? account.balance + newTx.amount : account.balance - newTx.amount;
			await tx.store.put({ ...account, balance: newBalance });
		}
		await tx.done;
		const allAccounts = await db.getAll("accounts");
		setAccounts(allAccounts);
	};

	const handleDeleteTransaction = async (txId) => {
		const db = await initDB();
		const txToDelete = await db.get("transactions", txId);
		if (!txToDelete) return;
		const accountTx = db.transaction("accounts", "readwrite");
		if (txToDelete.type === "transfer") {
			const fromAccount = await accountTx.store.get(txToDelete.from);
			const toAccount = await accountTx.store.get(txToDelete.to);
			if (fromAccount) await accountTx.store.put({ ...fromAccount, balance: fromAccount.balance + txToDelete.amount + (txToDelete.fee || 0) });
			if (toAccount) await accountTx.store.put({ ...toAccount, balance: toAccount.balance - txToDelete.amount });
		} else {
			const account = await accountTx.store.get(txToDelete.accountId);
			if (account) {
				const revertedBalance = txToDelete.type === "income" ? account.balance - txToDelete.amount : account.balance + txToDelete.amount;
				await accountTx.store.put({ ...account, balance: revertedBalance });
			}
		}
		await accountTx.done;
		await db.delete("transactions", txId);
		const allTxs = await db.getAll("transactions");
		const allAccounts = await db.getAll("accounts");
		setTransactions(sortTransactions(allTxs));
		setAccounts(allAccounts);
	};

	const handleSaveBudget = (newBudget) => {
		const index = budgets.findIndex((b) => b.id === newBudget.id);
		let updated;
		if (index > -1) {
			updated = [...budgets];
			updated[index] = newBudget;
		} else {
			updated = [...budgets, newBudget];
		}
		updateStateAndDB("budgets", updated, setBudgets);
	};

	const handleDeleteBudget = (budgetId) => {
		const updated = budgets.filter((b) => b.id !== budgetId);
		updateStateAndDB("budgets", updated, setBudgets);
	};

	const handleDuplicateBudget = (budgetId) => {
		const budgetToDuplicate = budgets.find((b) => b.id === budgetId);
		if (!budgetToDuplicate) return;
		const newBudget = { ...budgetToDuplicate, id: `bud-${Date.now()}`, name: `${budgetToDuplicate.name} (Copy)` };
		const updated = [...budgets, newBudget];
		updateStateAndDB("budgets", updated, setBudgets);
	};

	const handleSaveAccount = (newAccount, sourceAccountId) => {
		const isNewLoan = !accounts.find((a) => a.id === newAccount.id) && newAccount.type === "Loan";
		const index = accounts.findIndex((a) => a.id === newAccount.id);
		let updated;
		if (index > -1) {
			updated = [...accounts];
			updated[index] = newAccount;
		} else {
			updated = [...accounts, newAccount];
		}
		updateStateAndDB("accounts", updated, setAccounts);
		if (isNewLoan && sourceAccountId) {
			const loanExpenseTx = {
				id: `tx-${Date.now()}`,
				accountId: sourceAccountId,
				type: "expense",
				amount: newAccount.balance,
				category: "Loan Disbursed",
				date: formatDateForInput(new Date()),
				description: `Loan to ${newAccount.name}`,
			};
			handleSaveTransaction(loanExpenseTx);
		}
	};

	const handleDeleteAccount = (accountId) => {
		const updated = accounts.filter((a) => a.id !== accountId);
		updateStateAndDB("accounts", updated, setAccounts);
	};

	const handleSetCategories = (newCategories) => {
		updateStateAndDB("categories", newCategories, setCategories);
	};

	const handleSaveRecurringTransaction = (newRecTx) => {
		const index = recurringTransactions.findIndex((t) => t.id === newRecTx.id);
		let updated;
		if (index > -1) {
			updated = [...recurringTransactions];
			updated[index] = newRecTx;
		} else {
			updated = [...recurringTransactions, newRecTx];
		}
		updateStateAndDB("recurringTransactions", updated, setRecurringTransactions);
	};

	const handleDeleteRecurringTransaction = (recTxId) => {
		const updated = recurringTransactions.filter((t) => t.id !== recTxId);
		updateStateAndDB("recurringTransactions", updated, setRecurringTransactions);
	};

	return {
		accounts, setAccounts, budgets, setBudgets, transactions, setTransactions, notifications, setNotifications, categories, setCategories: handleSetCategories, recurringTransactions, setRecurringTransactions, handleSaveRecurringTransaction, handleDeleteRecurringTransaction, isDbLoading, calculatedData, handleSaveTransaction, handleDeleteTransaction, handleSaveBudget, handleDeleteBudget, handleDuplicateBudget, handleSaveAccount, handleDeleteAccount, updateStateAndDB
	};
};
