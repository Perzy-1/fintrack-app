#!/bin/bash

# --- Automated Refactoring Script for FinTrack App ---
# This script will restructure the single-file React application
# into a component-based architecture.

# --- Helper Functions ---
function create_file {
  # Create directory if it doesn't exist
  mkdir -p "$(dirname "$1")"
  # Create the file with the content
  cat > "$1"
}

# --- Main Execution ---
echo "Starting the refactoring process..."

# 1. Create Directory Structure
echo "Creating new directories..."
mkdir -p src/components/common src/components/modals src/components/accounts src/components/budget src/components/dashboard src/components/transactions
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/pages

# 2. Create Component, Hook, and Library Files
echo "Creating new component and library files..."

# --- src/lib/constants.js ---
create_file src/lib/constants.js <<'EOF'
import {
	Car, ShoppingCart, Clapperboard, Wifi, Home as HomeIcon, Briefcase, Gift, Plane, Users, DollarSign, PiggyBank, Smile, Star, Heart, ThumbsUp, Pizza, Coffee, Book, Film, Music, Gamepad2, Bus, Train, Bike, Building, Utensils, Shirt, Tv, Phone, CreditCard, Droplet, Sprout, Cat, Dog, PawPrint, GraduationCap, School, Landmark, Palette, Pencil, Popcorn, Banknote, Coins, Receipt, Repeat, Database, Copy, TrendingUp
} from "lucide-react";

export const STORES = ["accounts", "transactions", "budgets", "categories", "recurringTransactions", "appSettings"];

const getStartOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);
const getEndOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const formatDateForInput = (date) => {
	if (!date) return "";
	const d = new Date(date);
	const year = d.getFullYear();
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const day = d.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const initialAccounts = [
	{ id: "acc-1", name: "Main Checking", type: "Debit Card", balance: 4855 },
	{ id: "acc-2", name: "Vacation Fund", type: "Savings", balance: 1200 },
	{ id: "acc-3", name: "Emergency Fund", type: "Savings", balance: 3500 },
	{ id: "acc-4", name: "Cash on Hand", type: "Cash", balance: 150 },
];

export const defaultCategories = {
	expense: {
		Food: { icon: "ShoppingCart", color: "#EF4444", type: "icon" },
		Transport: { icon: "Car", color: "#3B82F6", type: "icon" },
		Entertainment: { icon: "Clapperboard", color: "#8B5CF6", type: "icon" },
		Utilities: { icon: "Wifi", color: "#F97316", type: "icon" },
		Rent: { icon: "HomeIcon", color: "#10B981", type: "icon" },
		Shopping: { icon: "Shirt", color: "#EC4899", type: "icon" },
		"Debt Payment": { icon: "Users", color: "#64748B", type: "icon" },
		"Loan Disbursed": { icon: "TrendingUp", color: "#A855F7", type: "icon" },
	},
	income: {
		Salary: { icon: "Briefcase", color: "#22C55E", type: "icon" },
		Gift: { icon: "Gift", color: "#EC4899", type: "icon" },
		Investment: { icon: "Coins", color: "#14B8A6", type: "icon" },
		"Loan Collection": { icon: "Users", color: "#64748B", type: "icon" },
	},
	special: {
		"Balance Correction": { icon: "PiggyBank", color: "#64748B", isProtected: true, type: "icon" },
		"Balance Adjustment": { icon: "PiggyBank", color: "#64748B", isProtected: true, type: "icon" },
	},
};

export const initialBudgets = [
	{
		id: "bud-1",
		name: "Monthly Expenses",
		period: "Monthly",
		startDate: formatDateForInput(getStartOfMonth()),
		endDate: formatDateForInput(getEndOfMonth()),
		categories: { Food: 400, Transport: 150, Entertainment: 200, Utilities: 150, Rent: 1500 },
		notificationThreshold: 0.8,
	},
];

export const initialTransactions = [
	{ id: "tx-1", accountId: "acc-1", type: "income", amount: 5000, category: "Salary", date: formatDateForInput(getStartOfMonth()), description: "Monthly Salary" },
	{ id: "tx-2", accountId: "acc-1", type: "expense", amount: 85, category: "Food", date: formatDateForInput(new Date()), description: "Groceries" },
	{ id: "tx-3", accountId: "acc-1", type: "expense", amount: 60, category: "Utilities", date: formatDateForInput(new Date()), description: "Internet Bill" },
];

export const initialData = {
	accounts: initialAccounts,
	transactions: initialTransactions,
	budgets: initialBudgets,
	categories: defaultCategories,
	recurringTransactions: [],
};

export const initialNotifications = [];

export const currencyMap = { USD: "$", EUR: "€", JPY: "¥", GBP: "£", PHP: "₱" };

export const iconMap = {
	Car, ShoppingCart, Clapperboard, Wifi, HomeIcon, Briefcase, Gift, Plane, Users, DollarSign, PiggyBank, Smile, Star, Heart, ThumbsUp, Pizza, Coffee, Book, Film, Music, Gamepad2, Bus, Train, Bike, Building, Utensils, Shirt, Tv, Phone, CreditCard, Droplet, Sprout, Cat, Dog, PawPrint, GraduationCap, School, Landmark, Palette, Pencil, Popcorn, Banknote, Coins, Receipt, Repeat, Database, Copy, TrendingUp
};
EOF

# --- src/lib/db.js ---
create_file src/lib/db.js <<'EOF'
import { STORES, defaultCategories } from './constants';

const DB_NAME = "fintrack-db";
const DB_VERSION = 2;

export const initDB = async () => {
	const { openDB } = await import("https://cdn.jsdelivr.net/npm/idb@7/build/index.js");
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			STORES.forEach((storeName) => {
				if (!db.objectStoreNames.contains(storeName)) {
					db.createObjectStore(storeName, { keyPath: "id" });
				}
			});
		},
	});
};

export const validateAndCleanData = (loadedData) => {
	const categories = {
		...defaultCategories,
		...loadedData.categories,
		expense: { ...defaultCategories.expense, ...(loadedData.categories?.expense || {}) },
		income: { ...defaultCategories.income, ...(loadedData.categories?.income || {}) },
		special: { ...defaultCategories.special, ...(loadedData.categories?.special || {}) },
	};
	return { ...loadedData, categories };
};
EOF

# --- src/lib/utils.js ---
create_file src/lib/utils.js <<'EOF'
import { currencyMap } from './constants';

export const getStartOfDay = (date = new Date()) => {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
};

export const getEndOfDay = (date = new Date()) => {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
};

export const getStartOfWeek = (date = new Date()) => {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	return getStartOfDay(d);
};

export const getEndOfWeek = (date = new Date()) => {
	const d = new Date(getStartOfWeek(date));
	d.setDate(d.getDate() + 6);
	return getEndOfDay(d);
};

export const getStartOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

export const getEndOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const getStartOfYear = (date = new Date()) => new Date(date.getFullYear(), 0, 1);

export const getEndOfYear = (date = new Date()) => new Date(date.getFullYear(), 11, 31);

export const formatDateForInput = (date) => {
	if (!date) return "";
	const d = new Date(date);
	const year = d.getFullYear();
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const day = d.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const formatRangeLabel = (period, date) => {
	const year = date.getFullYear();
	const monthName = date.toLocaleString("default", { month: "long" });

	switch (period) {
		case "daily":
			return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
		case "weekly": {
			const start = getStartOfWeek(date);
			const end = getEndOfWeek(date);
			const startMonth = start.toLocaleString("default", { month: "short" });
			const endMonth = end.toLocaleString("default", { month: "short" });
			if (start.getMonth() === end.getMonth()) {
				return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
			}
			return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
		}
		case "monthly":
			return `${monthName} ${year}`;
		case "annually":
			return `${year}`;
		default:
			return "Custom Range";
	}
};

export const formatCurrency = (amount, currencyKey = "USD") => {
	const symbol = currencyMap[currencyKey] || "$";
	return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDateHeader = (dateString) => {
	const date = new Date(dateString + "T00:00:00");
	return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};
EOF

# --- src/hooks/useFinTrack.js ---
create_file src/hooks/useFinTrack.js <<'EOF'
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
		accounts, setAccounts, budgets, setBudgets, transactions, setTransactions, notifications, setNotifications, categories, setCategories: handleSetCategories, recurringTransactions, setRecurringTransactions, handleSaveRecurringTransaction, handleDeleteRecurringTransaction, isDbLoading, calculatedData, handleSaveTransaction, handleDeleteTransaction, handleSaveBudget, handleDeleteBudget, handleDuplicateBudget, handleSaveAccount, handleDeleteAccount
	};
};
EOF

# --- src/hooks/useIsMobile.js ---
create_file src/hooks/useIsMobile.js <<'EOF'
import { useState, useEffect } from 'react';

export const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);
	return isMobile;
};
EOF

# --- src/hooks/useStickyState.js ---
create_file src/hooks/useStickyState.js <<'EOF'
import { useState, useEffect } from 'react';

export const useStickyState = (defaultValue, key) => {
	const [value, setValue] = useState(() => {
		try {
			const stickyValue = localStorage.getItem(key);
			if (stickyValue && typeof defaultValue === "object" && defaultValue instanceof Date) {
				return new Date(JSON.parse(stickyValue));
			}
			return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
		} catch {
			return defaultValue;
		}
	});
	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);
	return [value, setValue];
};
EOF

# --- src/components/common/BottomNav.jsx ---
create_file src/components/common/BottomNav.jsx <<'EOF'
import React from 'react';
import { Home, History, BarChart2, Wallet } from 'lucide-react';

const BottomNav = ({ activeView, onTabClick }) => {
	const navItems = [
		{ name: "Dashboard", icon: Home, view: "dashboard" },
		{ name: "Transactions", icon: History, view: "transactions" },
		{ name: "Budgets", icon: BarChart2, view: "budgets" },
		{ name: "Accounts", icon: Wallet, view: "accounts" },
	];
	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-20 md:hidden">
			{navItems.map((item) => (
				<button
					type="button"
					key={item.name}
					onClick={() => onTabClick(item.view)}
					className={`flex flex-col items-center space-y-1 w-20 ${activeView === item.view ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}
				>
					<item.icon className="h-6 w-6" />
					<span className="text-xs">{item.name}</span>
				</button>
			))}
		</div>
	);
};

export default BottomNav;
EOF

# --- src/components/common/CalculatorInput.jsx ---
create_file src/components/common/CalculatorInput.jsx <<'EOF'
import React, { useState, useEffect, useRef } from 'react';
import { Delete } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

const CalculatorKeypad = ({ onKeyPress, onDone, displayValue }) => {
	const keys = [
		"7", "8", "9", { label: "÷", value: "/", type: "operator" },
		"4", "5", "6", { label: "×", value: "*", type: "operator" },
		"1", "2", "3", { label: "-", value: "-", type: "operator" },
		".", "0", { icon: Delete, value: "backspace", type: "action" },
		{ label: "+", value: "+", type: "operator" },
	];

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm p-4 z-50 rounded-t-2xl">
			<div className="bg-slate-900 text-right p-4 rounded-lg mb-4 text-4xl font-light text-white h-20 flex items-center justify-end">
				{displayValue || "0"}
			</div>
			<div className="grid grid-cols-4 gap-2">
				{keys.map((key, i) => {
					const keyConfig = typeof key === "string" ? { label: key, value: key, type: "number" } : key;
					const isOperator = keyConfig.type === "operator";
					const isAction = keyConfig.type === "action";
					const isNumber = keyConfig.type === "number";

					return (
						<button
							key={i}
							type="button"
							onClick={() => onKeyPress(keyConfig.value || keyConfig.label)}
							className={`h-16 rounded-lg flex items-center justify-center text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors
                                ${isOperator ? "bg-indigo-500 text-white hover:bg-indigo-600" : ""}
                                ${isNumber || isAction ? "bg-slate-700 text-white hover:bg-slate-600" : ""}
                                `}
						>
							{keyConfig.icon ? <keyConfig.icon size={28} /> : keyConfig.label}
						</button>
					);
				})}
				<button
					type="button"
					onClick={onDone}
					className="col-span-4 h-16 rounded-lg flex items-center justify-center text-2xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-2"
				>
					OK
				</button>
			</div>
		</div>
	);
};

const CalculatorInput = ({ value, onChange, placeholder, ...props }) => {
	const isMobile = useIsMobile();
	const [showKeypad, setShowKeypad] = useState(false);
	const [displayValue, setDisplayValue] = useState(value || "");
	const inputRef = useRef(null);

	useEffect(() => {
		setDisplayValue(value || "");
	}, [value]);

	const handleKeyPress = (key) => {
		if (key === "backspace") {
			setDisplayValue((v) => v.slice(0, -1));
		} else {
			setDisplayValue((v) => v + key);
		}
	};

	const handleDone = () => {
		let result = 0;
		try {
			if (displayValue) {
				result = new Function(`return ${displayValue.replace(/×/g, "*").replace(/÷/g, "/")}`)();
			}
		} catch (e) {
			result = parseFloat(displayValue) || 0;
		}
		onChange({ target: { value: String(result || "") } });
		setShowKeypad(false);
		inputRef.current?.blur();
	};

	const handleFocus = (e) => {
		if (isMobile) {
			e.target.blur();
			setShowKeypad(true);
		}
	};

	return (
		<div className="relative">
			<input
				ref={inputRef}
				type="text"
				inputMode={isMobile ? "none" : "decimal"}
				value={value}
				onFocus={handleFocus}
				readOnly={isMobile}
				onChange={onChange}
				placeholder={placeholder}
				className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
				{...props}
			/>
			{isMobile && showKeypad && (
				<>
					<div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={handleDone}></div>
					<CalculatorKeypad onKeyPress={handleKeyPress} onDone={handleDone} displayValue={displayValue} />
				</>
			)}
		</div>
	);
};

export default CalculatorInput;
EOF

# --- src/components/common/Card.jsx ---
create_file src/components/common/Card.jsx <<'EOF'
import React from 'react';

const Card = ({ children, className = "" }) => (
	<div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 ${className}`}>
		{children}
	</div>
);

export default Card;
EOF

# --- src/components/common/CategoryIcon.jsx ---
create_file src/components/common/CategoryIcon.jsx <<'EOF'
import React from 'react';
import { DollarSign } from 'lucide-react';
import { iconMap } from '../../lib/constants';

const CategoryIcon = ({ name, className, type = "icon", ...props }) => {
	if (type === "emoji") {
		return <span className={`text-2xl inline-block ${className}`} {...props}>{name}</span>;
	}
	const IconComponent = iconMap[name] || DollarSign;
	return <IconComponent className={className} {...props} />;
};

export default CategoryIcon;
EOF

# --- src/components/common/ConfirmationModal.jsx ---
create_file src/components/common/ConfirmationModal.jsx <<'EOF'
import React from 'react';
import Card from './Card';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", children }) => {
	if (!isOpen) return null;
	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<Card className="w-full max-w-sm">
				<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h2>
				<p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
				{children}
				<div className="flex justify-end space-x-3 mt-4">
					<button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600">Cancel</button>
					<button type="button" onClick={onConfirm} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">{confirmText}</button>
				</div>
			</Card>
		</div>
	);
};

export default ConfirmationModal;
EOF

# --- src/components/common/ErrorBannerSystem.jsx ---
create_file src/components/common/ErrorBannerSystem.jsx <<'EOF'
import React from 'react';
import { X } from 'lucide-react';

const ErrorBannerSystem = ({ errors, onClose }) => (
	<div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 space-y-2 z-50">
		{errors.map((error) => (
			<div key={error.id} className="bg-red-500 text-white p-3 rounded-lg shadow-lg flex justify-between items-center animate-slide-in-fade-out">
				<span>{error.message} {error.count > 1 && `(${error.count})`}</span>
				<button onClick={() => onClose(error.id)}><X size={20} /></button>
			</div>
		))}
	</div>
);

export default ErrorBannerSystem;
EOF

# --- src/components/common/Header.jsx ---
create_file src/components/common/Header.jsx <<'EOF'
import React, { useState } from 'react';
import { Bell, Settings, ChevronLeft, AlertTriangle, CheckCircle } from 'lucide-react';

const Header = ({ onSettingsClick, notifications, onClearNotifications, pageTitle, onBack }) => {
	const [panelOpen, setPanelOpen] = useState(false);
	const unreadCount = notifications.filter((n) => !n.read).length;
	return (
		<header className="flex justify-between items-center px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-30">
			<div className="flex items-center">
				{onBack && (
					<button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2">
						<ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
					</button>
				)}
				<h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
			</div>
			<div className="flex items-center space-x-2 md:space-x-4">
				<div className="relative">
					<button type="button" onClick={() => setPanelOpen(!panelOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative">
						<Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
						{unreadCount > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>}
					</button>
					{panelOpen && (
						<div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-30">
							<div className="p-3 flex justify-between items-center border-b dark:border-gray-600">
								<h4 className="font-semibold text-gray-800 dark:text-white">Notifications</h4>
								{notifications.length > 0 && (
									<button type="button" onClick={() => { onClearNotifications(); setPanelOpen(false); }} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Clear all</button>
								)}
							</div>
							<div className="max-h-80 overflow-y-auto">
								{notifications.length > 0 ? (
									notifications.map((n) => (
										<div key={n.id} className="p-3 flex items-start space-x-3 border-b dark:border-gray-600 last:border-b-0">
											{n.type === "warning" ? <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" /> : <CheckCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />}
											<div>
												<p className="text-sm text-gray-700 dark:text-gray-200">{n.message}</p>
												<p className="text-xs text-gray-400 dark:text-gray-500">{new Date(n.date).toLocaleString()}</p>
											</div>
										</div>
									))
								) : (
									<p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No new notifications.</p>
								)}
							</div>
						</div>
					)}
				</div>
				<button type="button" onClick={onSettingsClick} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
					<Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
				</button>
			</div>
		</header>
	);
};

export default Header;
EOF

# --- src/components/common/ManagementButton.jsx ---
create_file src/components/common/ManagementButton.jsx <<'EOF'
import React from 'react';
import { ChevronRight } from 'lucide-react';

const ManagementButton = ({ onClick, icon: Icon, label }) => (
	<button onClick={onClick} className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
		<div className="flex items-center gap-3">
			<Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
			<span className="font-semibold">{label}</span>
		</div>
		<ChevronRight className="w-5 h-5 text-gray-400" />
	</button>
);

export default ManagementButton;
EOF

# --- src/components/common/Sidebar.jsx ---
create_file src/components/common/Sidebar.jsx <<'EOF'
import React from 'react';
import { Home, History, BarChart2, Wallet, Settings } from 'lucide-react';

const Sidebar = ({ activeView, onTabClick }) => {
	const navItems = [
		{ name: "Dashboard", icon: Home, view: "dashboard" },
		{ name: "Transactions", icon: History, view: "transactions" },
		{ name: "Budgets", icon: BarChart2, view: "budgets" },
		{ name: "Accounts", icon: Wallet, view: "accounts" },
		{ name: "Settings", icon: Settings, view: "settings" },
	];
	return (
		<div className="hidden md:block fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4">
			<h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">FinTrack</h2>
			<nav className="flex flex-col space-y-2">
				{navItems.map((item) => (
					<button
						type="button"
						key={item.name}
						onClick={() => onTabClick(item.view)}
						className={`flex items-center space-x-3 p-3 rounded-lg ${activeView === item.view ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
					>
						<item.icon className="h-6 w-6" /> <span>{item.name}</span>
					</button>
				))}
			</nav>
		</div>
	);
};

export default Sidebar;
EOF

# --- src/components/modals/AccountModal.jsx ---
create_file src/components/modals/AccountModal.jsx <<'EOF'
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
EOF

# --- src/components/modals/BudgetModal.jsx ---
create_file src/components/modals/BudgetModal.jsx <<'EOF'
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import CalculatorInput from '../common/CalculatorInput';
import { formatDateForInput, getStartOfMonth, getEndOfMonth } from '../../lib/utils';

const BudgetModal = ({ isOpen, onClose, onSave, budgetToEdit, masterCategories, onError }) => {
	const [name, setName] = useState("");
	const [period, setPeriod] = useState("Monthly");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [categories, setCategories] = useState({});
	const [selectedCat, setSelectedCat] = useState(Object.keys(masterCategories.expense)[0]);
	const [limit, setLimit] = useState("");
	const isEditMode = !!budgetToEdit;

	useEffect(() => {
		if (isOpen) {
			if (isEditMode) {
				setName(budgetToEdit.name);
				setPeriod(budgetToEdit.period);
				setStartDate(budgetToEdit.startDate);
				setEndDate(budgetToEdit.endDate);
				setCategories(budgetToEdit.categories);
			} else {
				setName("");
				setPeriod("Monthly");
				setStartDate(formatDateForInput(getStartOfMonth()));
				setEndDate(formatDateForInput(getEndOfMonth()));
				setCategories({});
			}
		}
	}, [isOpen, isEditMode, budgetToEdit]);

	useEffect(() => {
		if (period === "Monthly") {
			setStartDate(formatDateForInput(getStartOfMonth()));
			setEndDate(formatDateForInput(getEndOfMonth()));
		}
	}, [period]);

	const handleAddCategory = () => {
		if (selectedCat && limit) {
			setCategories((prev) => ({ ...prev, [selectedCat]: parseFloat(limit) }));
			setLimit("");
		}
	};

	const handleRemoveCategory = (catToRemove) => {
		setCategories((prev) => {
			const newCats = { ...prev };
			delete newCats[catToRemove];
			return newCats;
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name) { onError("Budget name is required."); return; }
		if (Object.keys(categories).length === 0) { onError("Please add at least one category to the budget."); return; }
		onSave({ id: isEditMode ? budgetToEdit.id : `bud-${Date.now()}`, name, period, startDate, endDate, categories, notificationThreshold: 0.8 });
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<Card className="w-full max-w-lg">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">{isEditMode ? "Edit" : "Create"} Budget</h2>
					<button type="button" onClick={onClose}><X className="h-6 w-6" /></button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="budget-name">Budget Name</label>
						<input id="budget-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
					</div>
					<div>
						<label htmlFor="budget-period">Period</label>
						<select id="budget-period" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							<option>Monthly</option><option>Custom</option>
						</select>
					</div>
					{period === "Custom" && (
						<div className="flex gap-2">
							<div>
								<label htmlFor="budget-start">Start Date</label>
								<input id="budget-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
							</div>
							<div>
								<label htmlFor="budget-end">End Date</label>
								<input id="budget-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
							</div>
						</div>
					)}
					<div className="border-t pt-4 dark:border-gray-600">
						<h4 className="font-semibold mb-2">Budget Categories</h4>
						<div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
							{Object.entries(categories).map(([cat, lim]) => (
								<div key={cat} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
									<span className="flex-grow">{cat}</span>
									<div className="flex items-center gap-2">
										<div className="bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-md text-sm font-mono">${lim.toFixed(2)}</div>
										<button type="button" onClick={() => handleRemoveCategory(cat)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 className="w-4 h-4 text-red-500" /></button>
									</div>
								</div>
							))}
						</div>
						<div className="flex gap-2 items-end">
							<div className="flex-grow">
								<label htmlFor="budget-cat-select" className="text-sm">Category</label>
								<select id="budget-cat-select" value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
									{Object.keys(masterCategories.expense).map((c) => (<option key={c} value={c}>{c}</option>))}
								</select>
							</div>
							<div className="w-32">
								<label htmlFor="budget-cat-limit" className="text-sm">Limit</label>
								<CalculatorInput id="budget-cat-limit" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="$0.00" />
							</div>
							<button type="button" onClick={handleAddCategory} className="p-2 h-10 bg-gray-200 dark:bg-gray-600 rounded-md"><Plus className="h-5 w-5" /></button>
						</div>
					</div>
					<button type="submit" className="w-full bg-indigo-600 text-white font-semibold p-3 rounded-lg hover:bg-indigo-700">{isEditMode ? "Save Changes" : "Create Budget"}</button>
				</form>
			</Card>
		</div>
	);
};

export default BudgetModal;
EOF

# --- src/components/modals/CategoryModal.jsx ---
create_file src/components/modals/CategoryModal.jsx <<'EOF'
import React, { useState, useEffect } from 'react';
import { X, Palette, Trash2, Edit } from 'lucide-react';
import Card from '../common/Card';
import CategoryIcon from '../common/CategoryIcon';
import ConfirmationModal from '../common/ConfirmationModal';
import { iconMap } from '../../lib/constants';

const CategoryModal = ({ isOpen, onClose, onSave, onDelete, categoryToEdit, onError, categoryType, categories }) => {
	const [name, setName] = useState("");
	const [originalName, setOriginalName] = useState("");
	const [icon, setIcon] = useState("DollarSign");
	const [iconType, setIconType] = useState("icon");
	const [color, setColor] = useState("#8B5CF6");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [pickerTab, setPickerTab] = useState("icons");
	const isEditMode = !!categoryToEdit;
	const colorPalette = ["#EF4444", "#F97316", "#F59E0B", "#84CC16", "#22C55E", "#10B981", "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899", "#78716C", "#64748B"];

	useEffect(() => {
		if (isOpen) {
			if (isEditMode) {
				setName(categoryToEdit.id);
				setOriginalName(categoryToEdit.id);
				setIcon(categoryToEdit.icon);
				setIconType(categoryToEdit.type || "icon");
				setColor(categoryToEdit.color);
				setPickerTab(categoryToEdit.type === "emoji" ? "emojis" : "icons");
			} else {
				setName("");
				setOriginalName("");
				setIcon("DollarSign");
				setIconType("icon");
				setColor("#8B5CF6");
				setPickerTab("icons");
			}
			setShowDeleteConfirm(false);
		}
	}, [isOpen, isEditMode, categoryToEdit]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name) { onError("Category name cannot be empty."); return; }
		if (!icon) { onError("Please select an icon or emoji."); return; }
		onSave({ id: name, originalId: originalName, icon, color, type: iconType, categoryType: categoryToEdit?.categoryType || categoryType });
		onClose();
	};

	const handleDelete = () => {
		onDelete(originalName, categoryToEdit.categoryType);
		setShowDeleteConfirm(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<Card className="w-full max-w-md">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-lg font-semibold">{isEditMode ? "Edit" : "Add"} Category</h2>
					<button type="button" onClick={onClose}><X className="h-6 w-6" /></button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="cat-name">Category Name</label>
						<input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
					</div>
					<div>
						<label>Icon</label>
						<div className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
							<div className="w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0" style={{ backgroundColor: color }}>
								<CategoryIcon name={icon} type={iconType} className="w-7 h-7 text-white" />
							</div>
							<div className="flex-grow">
								<div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
									<button type="button" onClick={() => setPickerTab("icons")} className={`px-4 py-1 text-sm flex-1 ${pickerTab === "icons" ? "bg-indigo-500 text-white" : "bg-transparent"}`}>Icons</button>
									<button type="button" onClick={() => setPickerTab("emojis")} className={`px-4 py-1 text-sm flex-1 ${pickerTab === "emojis" ? "bg-indigo-500 text-white" : "bg-transparent"}`}>Emojis</button>
								</div>
							</div>
						</div>
					</div>
					{pickerTab === "icons" && (
						<div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
							{Object.keys(iconMap).map((i) => (
								<button type="button" key={i} onClick={() => { setIcon(i); setIconType("icon"); }} className={`p-2 rounded-lg flex items-center justify-center ${icon === i && iconType === "icon" ? "bg-indigo-200 dark:bg-indigo-800" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}><CategoryIcon name={i} className="w-6 h-6" /></button>
							))}
						</div>
					)}
					{pickerTab === "emojis" && (
						<div>
							<label htmlFor="emoji-input">Enter Emoji</label>
							<input id="emoji-input" type="text" value={iconType === "emoji" ? icon : ""} onChange={(e) => { setIcon(e.target.value.slice(0, 2)); setIconType("emoji"); }} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-2xl text-center" placeholder="😀" />
						</div>
					)}
					<div>
						<label>Color</label>
						<div className="flex flex-wrap items-center gap-3 mt-2">
							{colorPalette.map((c) => (
								<button type="button" key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color === c ? "border-indigo-500 ring-2 ring-indigo-500" : "border-transparent"}`} style={{ backgroundColor: c }}></button>
							))}
							<div className="relative">
								<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-full opacity-0 absolute cursor-pointer" />
								<div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-500 flex items-center justify-center" style={{ backgroundColor: color }}><Palette size={16} className="text-white mix-blend-difference" /></div>
							</div>
							<input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 w-24 font-mono" placeholder="#8B5CF6" />
						</div>
					</div>
					<div className="flex justify-between items-center pt-4">
						{isEditMode && !categories.special[name] && (<button type="button" onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Delete</button>)}
						<div className="flex-grow" />
						<button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">{isEditMode ? "Save Changes" : "Add Category"}</button>
					</div>
				</form>
			</Card>
			<ConfirmationModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} title="Delete Category" message={`Are you sure you want to delete the "${categoryToEdit?.id}" category? This cannot be undone.`} />
		</div>
	);
};

export default CategoryModal;
EOF

# --- src/components/modals/DataManagementModal.jsx ---
create_file src/components/modals/DataManagementModal.jsx <<'EOF'
import React, { useState, useRef } from 'react';
import { X, Download, Upload, RefreshCw } from 'lucide-react';
import Card from '../common/Card';
import ConfirmationModal from '../common/ConfirmationModal';
import { initDB } from '../../lib/db';
import { STORES, initialData } from '../../lib/constants';
import { validateAndCleanData } from '../../lib/db';
import { formatDateForInput } from '../../lib/utils';

const DataManagementModal = ({ isOpen, onClose, finTrackData, onError }) => {
	const { setAccounts, setBudgets, setTransactions, setCategories, setRecurringTransactions } = finTrackData;
	const [showReset, setShowReset] = useState(false);
	const [showImportConfirm, setShowImportConfirm] = useState(false);
	const [showCsvConfirm, setShowCsvConfirm] = useState(false);
	const [dataToImport, setDataToImport] = useState(null);
	const [csvData, setCsvData] = useState(null);
	const jsonInputRef = useRef(null);
	const csvInputRef = useRef(null);

	const handleExport = async () => {
		const db = await initDB();
		const allData = { version: 2 };
		for (const storeName of STORES) {
			if (storeName === "categories") {
				const catData = await db.get("categories", "main");
				allData[storeName] = { expense: catData.expense, income: catData.income, special: catData.special };
			} else if (storeName === "accounts") {
				const accountsData = await db.getAll(storeName);
				allData[storeName] = accountsData.map((acc) => ({ ...acc, balance: 0 }));
			} else {
				allData[storeName] = await db.getAll(storeName);
			}
		}
		const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(allData, null, 2))}`;
		const link = document.createElement("a");
		link.href = jsonString;
		link.download = `fintrack_backup_${new Date().toISOString().split("T")[0]}.json`;
		link.click();
	};

	const handleJsonFileChange = (event) => {
		const file = event.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const importedData = JSON.parse(e.target.result);
				if (importedData.accounts && importedData.budgets && importedData.transactions && importedData.categories) {
					setDataToImport(importedData);
					setShowImportConfirm(true);
				} else {
					onError("Invalid backup file format.");
				}
			} catch (err) {
				onError("Failed to parse backup file.");
			}
		};
		reader.readAsText(file);
		event.target.value = null;
	};

	const confirmJsonImport = async () => {
		if (!dataToImport) return;
		const balances = {};
		dataToImport.accounts.forEach((acc) => { balances[acc.id] = 0; });
		const sortedTransactions = [...dataToImport.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
		sortedTransactions.forEach((tx) => {
			if (tx.type === "income") { if (balances[tx.accountId] !== undefined) balances[tx.accountId] += tx.amount; }
			else if (tx.type === "expense") { if (balances[tx.accountId] !== undefined) balances[tx.accountId] -= tx.amount; }
			else if (tx.type === "transfer") {
				if (balances[tx.from] !== undefined) balances[tx.from] -= tx.amount + (tx.fee || 0);
				if (balances[tx.to] !== undefined) balances[tx.to] += tx.amount;
			}
		});
		const recalculatedAccounts = dataToImport.accounts.map((acc) => ({ ...acc, balance: balances[acc.id] || 0 }));
		const db = await initDB();
		const dbTx = db.transaction(STORES, "readwrite");
		await Promise.all(STORES.map((name) => dbTx.objectStore(name).clear()));
		await Promise.all([
			...recalculatedAccounts.map((item) => dbTx.objectStore("accounts").put(item)),
			...dataToImport.transactions.map((item) => dbTx.objectStore("transactions").put(item)),
			...dataToImport.budgets.map((item) => dbTx.objectStore("budgets").put(item)),
			dbTx.objectStore("categories").put({ id: "main", ...dataToImport.categories }),
			...(dataToImport.recurringTransactions || []).map((item) => dbTx.objectStore("recurringTransactions").put(item)),
		]);
		await dbTx.done;
		const cleanedData = validateAndCleanData({ ...dataToImport, accounts: recalculatedAccounts });
		setAccounts(cleanedData.accounts);
		setTransactions(cleanedData.transactions);
		setBudgets(cleanedData.budgets);
		setCategories(cleanedData.categories);
		setRecurringTransactions(cleanedData.recurringTransactions || []);
		setShowImportConfirm(false);
		setDataToImport(null);
		onClose();
	};

	const handleCsvFileChange = (event) => {
		const file = event.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target.result;
				const { data, errors } = parseCsv(text);
				if (errors.length > 0) { onError(`CSV parsing errors: ${errors.join(", ")}`); return; }
				setCsvData(data);
				setShowCsvConfirm(true);
			} catch (err) {
				onError("Failed to parse CSV file.");
			}
		};
		reader.readAsText(file);
		event.target.value = null;
	};

	const parseCsv = (csvText) => {
		const lines = csvText.trim().split(/\r?\n/);
		if (lines.length < 2) return { data: [], errors: ["CSV must have a header and at least one data row."] };
		const headers = lines[0].split(",").map((h) => h.trim());
		const data = [];
		const errors = [];
		const requiredHeaders = ["date", "amount", "description", "type", "category"];
		for (const required of requiredHeaders) {
			if (!headers.includes(required)) errors.push(`Missing required header: ${required}`);
		}
		if (errors.length > 0) return { data: [], errors };
		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(",");
			const row = headers.reduce((obj, header, index) => {
				obj[header] = values[index]?.trim();
				return obj;
			}, {});
			data.push(row);
		}
		return { data, errors };
	};

	const confirmCsvImport = () => {
		if (!csvData) return;
		const defaultAccountId = finTrackData.accounts[0]?.id;
		if (!defaultAccountId) { onError("No default account available to import transactions."); return; }
		csvData.forEach((row, index) => {
			let finalCategory = row.category;
			if (row.description.trim().toLowerCase() === "difference") finalCategory = "Balance Adjustment";
			const newTx = {
				id: `tx-${Date.now()}-${index}`,
				accountId: defaultAccountId,
				amount: parseFloat(row.amount),
				date: formatDateForInput(new Date(row.date)),
				description: row.description,
				type: row.type,
				category: finalCategory,
			};
			finTrackData.handleSaveTransaction(newTx);
		});
		setShowCsvConfirm(false);
		setCsvData(null);
		onClose();
	};

	const resetData = async () => {
		const db = await initDB();
		const tx = db.transaction(STORES, "readwrite");
		await Promise.all(STORES.map((name) => tx.objectStore(name).clear()));
		await Promise.all([
			...initialData.accounts.map((item) => tx.objectStore("accounts").put(item)),
			...initialData.transactions.map((item) => tx.objectStore("transactions").put(item)),
			...initialData.budgets.map((item) => tx.objectStore("budgets").put(item)),
			tx.objectStore("categories").put({ id: "main", ...initialData.categories }),
			...initialData.recurringTransactions.map((item) => tx.objectStore("recurringTransactions").put(item)),
		]);
		await tx.done;
		setAccounts(initialData.accounts);
		setTransactions(initialData.transactions);
		setBudgets(initialData.budgets);
		setCategories(initialData.categories);
		setRecurringTransactions(initialData.recurringTransactions || []);
		setShowReset(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<Card className="w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold">Data Management</h3>
					<button type="button" onClick={onClose}><X /></button>
				</div>
				<div className="space-y-3">
					<input type="file" ref={jsonInputRef} onChange={handleJsonFileChange} className="hidden" accept=".json" />
					<input type="file" ref={csvInputRef} onChange={handleCsvFileChange} className="hidden" accept=".csv" />
					<button type="button" onClick={handleExport} className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"><Download className="h-5 w-5" /> Export Data</button>
					<button type="button" onClick={() => jsonInputRef.current.click()} className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Upload className="h-5 w-5" /> Import from Backup (.json)</button>
					<button type="button" onClick={() => csvInputRef.current.click()} className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"><Upload className="h-5 w-5" /> Import Transactions (.csv)</button>
					<button type="button" onClick={() => setShowReset(true)} className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"><RefreshCw className="h-5 w-5" /> Reset All Data</button>
				</div>
				<ConfirmationModal isOpen={showReset} onClose={() => setShowReset(false)} onConfirm={resetData} title="Reset All Data" message="Are you sure? This will delete all data and restore it to the initial state." />
				<ConfirmationModal isOpen={showImportConfirm} onClose={() => setShowImportConfirm(false)} onConfirm={confirmJsonImport} title="Import Data" message="This will overwrite all current data. Are you sure?" />
				<ConfirmationModal isOpen={showCsvConfirm} onClose={() => setShowCsvConfirm(false)} onConfirm={confirmCsvImport} title="Import CSV Transactions" message={`Are you sure you want to import ${csvData?.length} transactions? They will be added to your current data.`} />
			</Card>
		</div>
	);
};

export default DataManagementModal;
EOF

# --- src/components/modals/RecurringTransactionModal.jsx ---
create_file src/components/modals/RecurringTransactionModal.jsx <<'EOF'
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
EOF

# --- src/components/modals/TransactionModal.jsx ---
create_file src/components/modals/TransactionModal.jsx <<'EOF'
import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import Card from '../common/Card';
import CalculatorInput from '../common/CalculatorInput';
import { formatDateForInput } from '../../lib/utils';

const TransactionModal = ({ isOpen, onClose, onSave, transactionToEdit, accounts, categories, onError, isCorrectionMode }) => {
	const [type, setType] = useState("expense");
	const [accountId, setAccountId] = useState(accounts[0]?.id || "");
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState(Object.keys(categories.expense)[0] || "");
	const [date, setDate] = useState(formatDateForInput(new Date()));
	const [description, setDescription] = useState("");
	const [fromAccount, setFromAccount] = useState(accounts[0]?.id || "");
	const [toAccount, setToAccount] = useState(accounts[1]?.id || "");
	const [fee, setFee] = useState("");
	const isEditMode = !!transactionToEdit;

	const availableAccounts = useMemo(() => {
		if (type === "expense" && category === "Debt Payment") return accounts.filter((acc) => acc.type === "Liability");
		if (type === "income" && category === "Loan Collection") return accounts.filter((acc) => acc.type === "Loan");
		return accounts.filter((acc) => acc.type !== "Loan" && acc.type !== "Liability");
	}, [accounts, type, category]);

	const transferAccounts = useMemo(() => accounts.filter((acc) => acc.type !== "Loan" && acc.type !== "Liability"), [accounts]);

	useEffect(() => {
		if (isOpen) {
			const defaults = { type: "expense", accountId: availableAccounts[0]?.id || "", amount: "", category: Object.keys(categories.expense)[0] || "", date: formatDateForInput(new Date()), description: "", fromAccount: transferAccounts[0]?.id || "", toAccount: transferAccounts[1]?.id || "", fee: "" };
			const initial = isEditMode ? { ...defaults, ...transactionToEdit, amount: transactionToEdit.amount.toString(), fee: transactionToEdit.fee?.toString() || "" } : defaults;
			setType(initial.type);
			setAccountId(initial.accountId);
			setAmount(initial.amount);
			setCategory(initial.category);
			setDate(initial.date);
			setDescription(initial.description);
			setFromAccount(initial.from || initial.fromAccount);
			setToAccount(initial.to || initial.toAccount);
			setFee(initial.fee);
		}
	}, [isOpen, isEditMode, transactionToEdit, accounts, categories]);

	useEffect(() => {
		if (isCorrectionMode) return;
		if (type === "income") setCategory(Object.keys(categories.income)[0] || "");
		else setCategory(Object.keys(categories.expense)[0] || "");
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
		}
		onSave(newTx);
		onClose();
	};

	if (!isOpen) return null;
	const categoryOptions = type === "income" ? categories.income : categories.expense;
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
								<div className="flex items-center gap-4">
									<label htmlFor="tx-from" className="w-24">From</label>
									<select id="tx-from" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
										{transferAccounts.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
									</select>
								</div>
								<div className="flex items-center gap-4">
									<label htmlFor="tx-to" className="w-24">To</label>
									<select id="tx-to" value={toAccount} onChange={(e) => setToAccount(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
										{transferAccounts.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
									</select>
								</div>
								<div className="flex items-center gap-4">
									<label htmlFor="tx-fee" className="w-24">Fee</label>
									<CalculatorInput id="tx-fee" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0.00" />
								</div>
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
EOF

# --- src/components/accounts/AccountItem.jsx ---
create_file src/components/accounts/AccountItem.jsx <<'EOF'
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MoreVertical, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency, getStartOfMonth, getEndOfMonth } from '../../lib/utils';

const AccountItem = ({ account, transactions, accountModalControls, currency, onDelete, navigate }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuRef]);

	const { income, expenses } = useMemo(() => {
		const now = new Date();
		const startOfMonth = getStartOfMonth(now);
		const endOfMonth = getEndOfMonth(now);
		let income = 0, expenses = 0;
		transactions
			.filter((tx) => {
				const txDate = new Date(tx.date + "T00:00:00");
				const isRelated = tx.accountId === account.id || tx.to === account.id || tx.from === account.id;
				return isRelated && txDate >= startOfMonth && txDate <= endOfMonth;
			})
			.forEach((tx) => {
				const isCorrection = tx.category === "Balance Correction" || tx.category === "Balance Adjustment";
				if (tx.type === "income" && tx.accountId === account.id && !isCorrection) income += tx.amount;
				else if (tx.type === "expense" && tx.accountId === account.id && !isCorrection) expenses += tx.amount;
				else if (tx.type === "transfer") {
					if (tx.to === account.id) income += tx.amount;
					if (tx.from === account.id) expenses += tx.amount + (tx.fee || 0);
				}
			});
		return { income, expenses };
	}, [account.id, transactions]);

	const handleNavigation = () => {
		if (account.type === "Loan") navigate("loanDetail", account.id);
		else navigate("accountDetail", account.id);
	};

	const isOverdue = account.type === "Loan" && account.overdueAmount > 0;

	return (
		<div className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
			<div className="flex-grow cursor-pointer" onClick={handleNavigation}>
				<div className="flex justify-between items-center p-4 w-full">
					<div className="flex items-center gap-2">
						{isOverdue && <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
						<div>
							<p className="font-semibold text-gray-800 dark:text-gray-100">{account.name}</p>
							<p className="text-sm text-gray-500 dark:text-gray-400">{account.type}</p>
						</div>
					</div>
					<div className="text-right">
						<p className="text-lg font-bold text-gray-800 dark:text-gray-100">{formatCurrency(account.balance, currency)}</p>
						<p className="text-xs text-gray-400">
							<span className="text-green-500">+{formatCurrency(income, currency)}</span>
							<span className="text-red-500 ml-2">-{formatCurrency(expenses, currency)}</span>
						</p>
					</div>
				</div>
			</div>
			<div className="relative pr-4" ref={menuRef}>
				<button type="button" onClick={() => setMenuOpen((o) => !o)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><MoreVertical size={20} /></button>
				{menuOpen && (
					<div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20">
						<button type="button" onClick={() => { accountModalControls.edit(account); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"><Edit size={16} className="mr-2" /> Edit</button>
						<button type="button" onClick={() => { onDelete(account.id); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"><Trash2 size={16} className="mr-2" /> Delete</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default AccountItem;
EOF

# --- src/components/accounts/NetWorthCard.jsx ---
create_file src/components/accounts/NetWorthCard.jsx <<'EOF'
import React from 'react';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import Card from '../common/Card';
import { formatCurrency } from '../../lib/utils';

const NetWorthCard = ({ calculatedData, currency }) => (
	<Card>
		<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Net Worth</h2>
		<div className="text-center mb-4">
			<p className="text-3xl md:text-4xl font-bold">{formatCurrency(calculatedData.netWorth, currency)}</p>
		</div>
		<div className="grid grid-cols-3 gap-4 text-center text-sm">
			<div>
				<div className="flex items-center justify-center gap-2 text-green-500"><TrendingUp size={16} /><span className="font-medium">Assets</span></div>
				<p>{formatCurrency(calculatedData.totalAssets, currency)}</p>
			</div>
			<div>
				<div className="flex items-center justify-center gap-2 text-blue-500"><Users size={16} /><span className="font-medium">Loans</span></div>
				<p>{formatCurrency(calculatedData.totalLoans, currency)}</p>
			</div>
			<div>
				<div className="flex items-center justify-center gap-2 text-red-500"><TrendingDown size={16} /><span className="font-medium">Liabilities</span></div>
				<p>{formatCurrency(calculatedData.totalLiabilities, currency)}</p>
			</div>
		</div>
	</Card>
);

export default NetWorthCard;
EOF

# --- src/components/budget/BudgetCard.jsx ---
create_file src/components/budget/BudgetCard.jsx <<'EOF'
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
EOF

# --- src/components/dashboard/FutureProjection.jsx ---
create_file src/components/dashboard/FutureProjection.jsx <<'EOF'
import React, { useMemo } from 'react';
import Card from '../common/Card';
import { formatCurrency } from '../../lib/utils';

const FutureProjection = ({ transactions, currentBalance, currency }) => {
	const projection = useMemo(() => {
		const today = new Date();
		const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
		const recentExpenses = transactions.filter((t) => new Date(t.date) >= thirtyDaysAgo && t.type === "expense");
		if (recentExpenses.length === 0) return { weekly: 0, monthly: 0, endOfMonthBalance: currentBalance };
		const totalSpent = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
		const dailyAvg = totalSpent / 30;
		const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
		const daysRemaining = daysInMonth - today.getDate();
		const weeklyProjection = dailyAvg * 7;
		const restOfMonthProjection = dailyAvg * daysRemaining;
		const endOfMonthBalance = currentBalance - restOfMonthProjection;
		return { weekly: weeklyProjection, monthly: restOfMonthProjection, endOfMonthBalance };
	}, [transactions, currentBalance]);

	return (
		<Card>
			<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Future Projection</h2>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-500">Est. spending next 7 days:</span>
					<span className="font-semibold">~{formatCurrency(projection.weekly, currency)}</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-500">Est. spending rest of month:</span>
					<span className="font-semibold">~{formatCurrency(projection.monthly, currency)}</span>
				</div>
				<div className="border-t dark:border-gray-700 my-2"></div>
				<div className="flex justify-between items-center">
					<span className="font-semibold">Projected End-of-Month Balance:</span>
					<span className={`text-xl font-bold ${projection.endOfMonthBalance >= 0 ? "text-green-500" : "text-red-500"}`}>{formatCurrency(projection.endOfMonthBalance, currency)}</span>
				</div>
			</div>
			<p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">Based on spending over the last 30 days.</p>
		</Card>
	);
};

export default FutureProjection;
EOF

# --- src/components/dashboard/SpendingAnalysis.jsx ---
create_file src/components/dashboard/SpendingAnalysis.jsx <<'EOF'
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Card from '../common/Card';
import { formatCurrency } from '../../lib/utils';

const SpendingAnalysis = ({ transactions, budget, categories, currency }) => {
	const analysisData = useMemo(() => {
		if (!budget) return [];
		const expensesByCategory = transactions
			.filter((tx) => tx.type === "expense" && tx.date >= budget.startDate && tx.date <= budget.endDate)
			.reduce((acc, tx) => {
				acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
				return acc;
			}, {});
		return Object.keys(budget.categories).map((category) => {
			const categoryInfo = categories.expense ? categories.expense[category] : null;
			return { name: category, spent: expensesByCategory[category] || 0, budget: budget.categories[category], fill: categoryInfo?.color || "#8884d8" };
		});
	}, [transactions, budget, categories]);

	if (!budget) return (
		<Card>
			<h2 className="text-lg font-semibold mb-4">Spending Analysis</h2>
			<p>No active budget for the current period.</p>
		</Card>
	);

	return (
		<Card>
			<h2 className="text-lg font-semibold mb-4">Spending Analysis: {budget.name}</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={analysisData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" tick={{ fontSize: 12 }} />
					<YAxis tickFormatter={(value) => formatCurrency(value, currency).replace(/(\.00$)/, "")} />
					<Tooltip formatter={(value) => formatCurrency(value, currency)} />
					<Legend />
					<Bar dataKey="budget" name="Budget" fill="#e2e8f0" stackId="a" />
					<Bar dataKey="spent" name="Spent" stackId="a">
						{analysisData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
};

export default SpendingAnalysis;
EOF

# --- src/components/transactions/TransactionItem.jsx ---
create_file src/components/transactions/TransactionItem.jsx <<'EOF'
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MoreVertical, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon';
import { formatCurrency } from '../../lib/utils';

const TransactionItem = ({ tx, txModalControls, accounts, categories, currency, contextAccountId }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuRef]);

	const info = useMemo(() => {
		if (tx.category === "Balance Correction" || tx.category === "Balance Adjustment") {
			const account = accounts.find((a) => a.id === tx.accountId);
			return { icon: "PiggyBank", color: tx.type === "income" ? "text-green-500" : "text-red-500", title: tx.description || "Balance Adjustment", subtitle: account ? account.name : "Modified Bal.", iconType: "icon", amountPrefix: tx.type === "income" ? "+" : "-" };
		}
		if (tx.type === "transfer") {
			const fromAccountName = accounts.find((a) => a.id === tx.from)?.name || "Unknown";
			const toAccountName = accounts.find((a) => a.id === tx.to)?.name || "Unknown";
			const subtitle = `From ${fromAccountName} to ${toAccountName}`;
			const title = tx.description || "Transfer";
			let color = "text-blue-500", amountPrefix = "";
			if (contextAccountId && contextAccountId !== "all") {
				if (tx.to === contextAccountId) { color = "text-green-500"; amountPrefix = "+"; }
				else if (tx.from === contextAccountId) { color = "text-red-500"; amountPrefix = "-"; }
			}
			return { icon: ArrowRightLeft, color, title, subtitle, amountPrefix };
		}
		const categoryInfo = (categories[tx.type] && categories[tx.type][tx.category]) || (categories.special && categories.special[tx.category]);
		return { icon: categoryInfo?.icon || "DollarSign", color: tx.type === "income" ? "text-green-500" : "text-red-500", title: tx.description || tx.category, subtitle: tx.category, iconType: categoryInfo?.type, amountPrefix: tx.type === "income" ? "+" : "-" };
	}, [tx, accounts, categories, contextAccountId]);

	return (
		<div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50">
			<div className="flex items-center space-x-4 flex-1">
				<div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
					<CategoryIcon name={info.icon} type={info.iconType} className={`h-6 w-6 ${info.color}`} />
				</div>
				<div>
					<p className="font-semibold">{info.title}</p>
					<p className="text-sm text-gray-500">{info.subtitle}</p>
				</div>
			</div>
			<div className="flex items-center space-x-2">
				<div className="text-right">
					<p className={`font-semibold ${info.color}`}>{info.amountPrefix}{formatCurrency(tx.amount, currency)}</p>
					<p className="text-sm text-gray-500">{new Date(tx.date + "T00:00:00").toLocaleDateString()}</p>
				</div>
				<div className="relative" ref={menuRef}>
					<button type="button" onClick={() => setMenuOpen((o) => !o)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><MoreVertical size={20} /></button>
					{menuOpen && (
						<div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20">
							<button type="button" onClick={() => { txModalControls.edit(tx); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"><Edit size={16} className="mr-2" /> Edit</button>
							<button type="button" onClick={() => { txModalControls.delete(tx.id); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"><Trash2 size={16} className="mr-2" /> Delete</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TransactionItem;
EOF

# --- src/components/transactions/TransactionList.jsx ---
create_file src/components/transactions/TransactionList.jsx <<'EOF'
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
EOF

# --- src/pages/AccountDetailPage.jsx ---
create_file src/pages/AccountDetailPage.jsx <<'EOF'
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/common/Card';
import TransactionList from '../components/transactions/TransactionList';
import { useStickyState } from '../hooks/useStickyState';
import { formatCurrency, formatDateForInput, getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, formatRangeLabel } from '../lib/utils';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const AccountDetailPage = ({ account, finTrackData, txModalControls }) => {
	const { transactions, accounts, categories, currency } = finTrackData;
	const [filterPeriod, setFilterPeriod] = useStickyState("monthly", `fintrack-accdetail-filter-period-${account.id}`);
	const [referenceDate, setReferenceDate] = useStickyState(new Date().toISOString(), `fintrack-accdetail-reference-date-${account.id}`);
	const [filter, setFilter] = useState({ startDate: formatDateForInput(getStartOfMonth(new Date(referenceDate))), endDate: formatDateForInput(getEndOfMonth(new Date(referenceDate))), type: "all" });

	useEffect(() => {
		if (filterPeriod === "custom") return;
		let start, end;
		const ref = new Date(referenceDate);
		switch (filterPeriod) {
			case "daily": start = getStartOfDay(ref); end = getEndOfDay(ref); break;
			case "weekly": start = getStartOfWeek(ref); end = getEndOfWeek(ref); break;
			case "annually": start = getStartOfYear(ref); end = getEndOfYear(ref); break;
			case "monthly": default: start = getStartOfMonth(ref); end = getEndOfMonth(ref); break;
		}
		setFilter((prev) => ({ ...prev, startDate: formatDateForInput(start), endDate: formatDateForInput(end) }));
	}, [filterPeriod, referenceDate]);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilter((prev) => ({ ...prev, [name]: value }));
	};
	const handlePeriodChange = (period) => {
		setFilterPeriod(period);
		if (period !== "custom") setReferenceDate(new Date().toISOString());
	};
	const handlePrev = () => {
		const newDate = new Date(referenceDate);
		switch (filterPeriod) {
			case "daily": newDate.setDate(newDate.getDate() - 1); break;
			case "weekly": newDate.setDate(newDate.getDate() - 7); break;
			case "monthly": newDate.setMonth(newDate.getMonth() - 1); break;
			case "annually": newDate.setFullYear(newDate.getFullYear() - 1); break;
			default: break;
		}
		setReferenceDate(newDate.toISOString());
	};
	const handleNext = () => {
		const newDate = new Date(referenceDate);
		switch (filterPeriod) {
			case "daily": newDate.setDate(newDate.getDate() + 1); break;
			case "weekly": newDate.setDate(newDate.getDate() + 7); break;
			case "monthly": newDate.setMonth(newDate.getMonth() + 1); break;
			case "annually": newDate.setFullYear(newDate.getFullYear() + 1); break;
			default: break;
		}
		setReferenceDate(newDate.toISOString());
	};

	const { filteredTransactions, totalDeposits, totalWithdrawals, netTotal } = useMemo(() => {
		const specialCategories = Object.keys(categories.special || {});
		let deposits = 0, withdrawals = 0;
		const transactionsInPeriod = transactions.filter((tx) => {
			const txDate = new Date(tx.date + "T00:00:00");
			const startDate = new Date(filter.startDate + "T00:00:00");
			const endDate = new Date(filter.endDate + "T00:00:00");
			return txDate >= startDate && txDate <= endDate;
		});
		const accountTransactions = transactionsInPeriod.filter((tx) => {
			if (tx.type === "transfer") return tx.from === account.id || tx.to === account.id;
			return tx.accountId === account.id;
		});
		accountTransactions.forEach((tx) => {
			if (tx.type === "income" || (tx.type === "transfer" && tx.to === account.id)) deposits += tx.amount;
			else if (tx.type === "expense" || (tx.type === "transfer" && tx.from === account.id)) {
				withdrawals += tx.amount;
				if (tx.type === "transfer" && tx.fee) withdrawals += tx.fee;
			}
		});
		const filteredList = accountTransactions.filter((tx) => {
			if (filter.type === "all") return true;
			if ((filter.type === "income" || filter.type === "expense") && specialCategories.includes(tx.category)) return false;
			return tx.type === filter.type;
		});
		return { filteredTransactions: filteredList, totalDeposits: deposits, totalWithdrawals: withdrawals, netTotal: deposits - withdrawals };
	}, [transactions, filter, account.id, categories]);

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
					<div>
						<h3 className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Deposits</h3>
						<p className="text-base md:text-lg font-semibold text-green-500">{formatCurrency(totalDeposits, currency)}</p>
					</div>
					<div>
						<h3 className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Withdrawals</h3>
						<p className="text-base md:text-lg font-semibold text-red-500">{formatCurrency(totalWithdrawals, currency)}</p>
					</div>
					<div>
						<h3 className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Net Total</h3>
						<p className={`text-base md:text-lg font-semibold ${netTotal >= 0 ? "text-green-500" : "text-red-500"}`}>{formatCurrency(netTotal, currency)}</p>
					</div>
					<div>
						<h3 className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Balance</h3>
						<p className="text-base md:text-lg font-semibold">{formatCurrency(account.balance, currency)}</p>
					</div>
				</div>
				{(account.interestRate || account.dueDate) && (
					<div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-around text-xs md:text-sm text-gray-500 dark:text-gray-400">
						{account.interestRate && <p>Interest: <strong>{account.interestRate}%</strong></p>}
						{account.dueDate && <p>Due Date: <strong>{new Date(account.dueDate + "T00:00:00").toLocaleDateString()}</strong></p>}
					</div>
				)}
			</Card>
			<div className="bg-white dark:bg-gray-800 p-4 md:px-6 shadow-sm">
				<div className="relative flex justify-center items-center gap-2 mb-4">
					<button onClick={handlePrev} disabled={filterPeriod === "custom"} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-5 w-5" /></button>
					<span className="font-semibold text-center w-auto sm:w-48 flex-shrink-0">{formatRangeLabel(filterPeriod, new Date(referenceDate))}</span>
					<button onClick={handleNext} disabled={filterPeriod === "custom"} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-5 w-5" /></button>
					<button onClick={() => handlePeriodChange("custom")} className={`absolute top-0 right-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${filterPeriod === "custom" ? "text-indigo-600" : ""}`}><Filter size={20} /></button>
				</div>
				<div className="flex justify-center flex-wrap gap-2 mb-4 border-b dark:border-gray-700 pb-4">
					{["daily", "weekly", "monthly", "annually"].map((p) => (<button key={p} onClick={() => handlePeriodChange(p)} className={`px-3 py-1 text-sm rounded-full capitalize ${filterPeriod === p ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}>{p}</button>))}
				</div>
				{filterPeriod === "custom" && (
					<div className="grid grid-cols-2 gap-4 items-end mb-4">
						<div>
							<label htmlFor="startDate" className="text-sm font-medium text-gray-600 dark:text-gray-300">Start Date</label>
							<input type="date" name="startDate" id="startDate" value={filter.startDate} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
						</div>
						<div>
							<label htmlFor="endDate" className="text-sm font-medium text-gray-600 dark:text-gray-300">End Date</label>
							<input type="date" name="endDate" id="endDate" value={filter.endDate} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
						</div>
					</div>
				)}
				<div className="grid grid-cols-1 gap-4 items-end">
					<div>
						<label htmlFor="type" className="text-sm font-medium text-gray-600 dark:text-gray-300">Type</label>
						<select name="type" id="type" value={filter.type} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							<option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option><option value="transfer">Transfer</option>
						</select>
					</div>
				</div>
			</div>
			<div className="p-4 md:p-6 md:pt-0">
				<TransactionList title="Transactions" transactions={filteredTransactions} txModalControls={txModalControls} accounts={accounts} categories={categories} currency={currency} contextAccountId={account.id} />
			</div>
		</div>
	);
};

export default AccountDetailPage;
EOF

# --- src/pages/AccountsPage.jsx ---
create_file src/pages/AccountsPage.jsx <<'EOF'
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
				<h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
					<span>Assets & Loans</span>
					<span className="text-base font-bold text-green-500">{formatCurrency(totalAssets, currency)}</span>
				</h3>
				<div className="divide-y divide-gray-200 dark:divide-gray-700">
					{assetAccounts.map((account) => (<AccountItem key={account.id} account={account} transactions={transactions} accountModalControls={accountModalControls} currency={currency} onDelete={handleDeleteRequest} navigate={navigate} />))}
					{loanAccounts.map((account) => (<AccountItem key={account.id} account={account} transactions={transactions} accountModalControls={accountModalControls} currency={currency} onDelete={handleDeleteRequest} navigate={navigate} />))}
				</div>
			</Card>
			<Card>
				<h3 className="text-lg font-semibold mb-2 flex justify-between items-center">
					<span>Liabilities</span>
					<span className="text-base font-bold text-red-500">{formatCurrency(totalLiabilities, currency)}</span>
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
EOF

# --- src/pages/BudgetsPage.jsx ---
create_file src/pages/BudgetsPage.jsx <<'EOF'
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
EOF

# --- src/pages/DashboardPage.jsx ---
create_file src/pages/DashboardPage.jsx <<'EOF'
import React, { useState, useMemo } from 'react';
import NetWorthCard from '../components/accounts/NetWorthCard';
import Card from '../components/common/Card';
import SpendingAnalysis from '../components/dashboard/SpendingAnalysis';
import FutureProjection from '../components/dashboard/FutureProjection';
import TransactionList from '../components/transactions/TransactionList';
import { formatCurrency, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, formatRangeLabel } from '../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DashboardPage = ({ finTrackData, txModalControls }) => {
	const { transactions, budgets, calculatedData, categories, accounts, currency } = finTrackData;
	const [filterPeriod, setFilterPeriod] = useState("monthly");
	const [referenceDate, setReferenceDate] = useState(new Date());

	const { income, expenses, net } = useMemo(() => {
		const specialCategories = Object.keys(categories.special || {});
		let start, end;
		const ref = new Date(referenceDate);
		if (filterPeriod === "monthly") { start = getStartOfMonth(ref); end = getEndOfMonth(ref); }
		else { start = getStartOfYear(ref); end = getEndOfYear(ref); }
		let income = 0, expenses = 0;
		transactions
			.filter((tx) => { const txDate = new Date(tx.date + "T00:00:00"); return txDate >= start && txDate <= end; })
			.forEach((tx) => {
				const toAccount = accounts.find((a) => a.id === tx.to);
				if (tx.type === "income" && !specialCategories.includes(tx.category)) income += tx.amount;
				else if (tx.type === "expense" && !specialCategories.includes(tx.category)) expenses += tx.amount;
				else if (tx.type === "transfer") {
					if (toAccount?.type === "Liability") expenses += tx.amount;
				}
			});
		return { income, expenses, net: income - expenses };
	}, [transactions, filterPeriod, referenceDate, accounts, categories]);

	const handlePrev = () => {
		const newDate = new Date(referenceDate);
		if (filterPeriod === "monthly") newDate.setMonth(newDate.getMonth() - 1);
		else newDate.setFullYear(newDate.getFullYear() - 1);
		setReferenceDate(newDate);
	};
	const handleNext = () => {
		const newDate = new Date(referenceDate);
		if (filterPeriod === "monthly") newDate.setMonth(newDate.getMonth() + 1);
		else newDate.setFullYear(newDate.getFullYear() + 1);
		setReferenceDate(newDate);
	};

	return (
		<div className="p-4 md:p-6 space-y-6">
			<NetWorthCard calculatedData={calculatedData} currency={currency} />
			<Card>
				<div className="flex justify-center items-center gap-2 mb-4">
					<button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><ChevronLeft className="h-5 w-5" /></button>
					<span className="font-semibold text-center w-32">{formatRangeLabel(filterPeriod, referenceDate)}</span>
					<button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><ChevronRight className="h-5 w-5" /></button>
				</div>
				<div className="flex justify-center flex-wrap gap-2 mb-4">
					{["monthly", "annually"].map((p) => (<button key={p} onClick={() => setFilterPeriod(p)} className={`px-3 py-1 text-sm rounded-full capitalize ${filterPeriod === p ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}>{p}</button>))}
				</div>
				<div className="flex flex-row justify-around gap-4 text-center">
					<div>
						<h2 className="text-sm font-medium text-gray-500">Income</h2>
						<p className="text-xl font-semibold text-green-500">{formatCurrency(income, currency)}</p>
					</div>
					<div>
						<h2 className="text-sm font-medium text-gray-500">Expenses</h2>
						<p className="text-xl font-semibold text-red-500">{formatCurrency(expenses, currency)}</p>
					</div>
					<div>
						<h2 className="text-sm font-medium text-gray-500">Net</h2>
						<p className={`text-xl font-semibold ${net >= 0 ? "text-green-500" : "text-red-500"}`}>{formatCurrency(net, currency)}</p>
					</div>
				</div>
			</Card>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<SpendingAnalysis transactions={transactions} budget={budgets.find((b) => new Date(b.startDate) <= new Date() && new Date(b.endDate) >= new Date())} categories={categories} currency={currency} />
				<FutureProjection transactions={transactions} currentBalance={calculatedData.totalAssets} currency={currency} />
			</div>
			<TransactionList title="Recent Transactions" transactions={transactions.slice(0, 5)} txModalControls={txModalControls} accounts={accounts} categories={categories} currency={currency} />
		</div>
	);
};

export default DashboardPage;
EOF

# --- src/pages/LoanDetailPage.jsx ---
create_file src/pages/LoanDetailPage.jsx <<'EOF'
import React, { useMemo } from 'react';
import Card from '../components/common/Card';
import TransactionList from '../components/transactions/TransactionList';
import { formatCurrency, formatDateForInput } from '../lib/utils';
import { AlertTriangle } from 'lucide-react';

const LoanDetailPage = ({ account, finTrackData, txModalControls }) => {
	const { transactions, accounts, categories, currency } = finTrackData;

	const { relatedTransactions, totalPaid, nextPaymentDate, nextPaymentAmount } = useMemo(() => {
		const related = transactions.filter((tx) => tx.type === "income" && tx.category === "Loan Collection" && tx.accountId === account.id);
		const totalPaid = related.reduce((sum, tx) => sum + tx.amount, 0);
		let nextPaymentDate = "N/A", nextPaymentAmount = 0;
		const interest = (account.balance * (parseFloat(account.interestRate) || 0)) / 100;

		if (account.interestCollectionFrequency !== "End of Term") {
			const lastDate = account.lastProcessedDate ? new Date(account.lastProcessedDate) : new Date(account.id.split("-")[1]);
			const newDate = new Date(lastDate);
			if (account.interestCollectionFrequency === "Daily") { newDate.setDate(newDate.getDate() + 1); nextPaymentAmount = interest / 365; }
			else if (account.interestCollectionFrequency === "Monthly") { newDate.setMonth(newDate.getMonth() + 1); nextPaymentAmount = interest / 12; }
			else if (account.interestCollectionFrequency === "Yearly") { newDate.setFullYear(newDate.getFullYear() + 1); nextPaymentAmount = interest; }
			nextPaymentDate = formatDateForInput(newDate);
		}
		if (account.overdueAmount > 0) nextPaymentAmount += account.overdueAmount;

		return { relatedTransactions: related, totalPaid, nextPaymentDate, nextPaymentAmount };
	}, [account, transactions]);

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card>
				<h3 className="text-lg font-semibold mb-4">Loan Summary</h3>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="font-semibold text-gray-500">Principal Lent:</div><div>{formatCurrency(account.balance, currency)}</div>
					<div className="font-semibold text-gray-500">Interest Rate:</div><div>{account.interestRate || "0"}%</div>
					<div className="font-semibold text-gray-500">Total Paid Back:</div><div className="text-green-500">{formatCurrency(totalPaid, currency)}</div>
					<div className="font-semibold text-gray-500">Remaining Balance:</div><div className="font-bold">{formatCurrency(account.balance - totalPaid, currency)}</div>
					<div className="font-semibold text-gray-500">Collection Schedule:</div><div>{account.interestCollectionFrequency}</div>
					<div className="font-semibold text-gray-500">Final Due Date:</div><div>{account.dueDate}</div>
				</div>
			</Card>
			<Card>
				<h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div className="font-semibold text-gray-500">Next Payment Due:</div><div className="font-bold">{nextPaymentDate}</div>
					<div className="font-semibold text-gray-500">Next Payment Amount:</div><div className="font-bold text-blue-500">{formatCurrency(nextPaymentAmount, currency)}</div>
					{account.overdueAmount > 0 && (
						<div className="font-semibold text-yellow-500 col-span-2 text-center pt-2 border-t mt-2"><AlertTriangle className="inline-block mr-2" size={16} />Overdue Amount: {formatCurrency(account.overdueAmount, currency)}</div>
					)}
				</div>
			</Card>
			<TransactionList title="Payment History" transactions={relatedTransactions} txModalControls={txModalControls} accounts={accounts} categories={categories} currency={currency} />
		</div>
	);
};

export default LoanDetailPage;
EOF

# --- src/pages/ManageAccountsPage.jsx ---
create_file src/pages/ManageAccountsPage.jsx <<'EOF'
import React from 'react';
import AccountsPage from './AccountsPage'; // Re-use the same component

const ManageAccountsPage = (props) => {
	return <AccountsPage {...props} />;
};

export default ManageAccountsPage;
EOF

# --- src/pages/ManageCategoriesPage.jsx ---
create_file src/pages/ManageCategoriesPage.jsx <<'EOF'
import React, { useState } from 'react';
import Card from '../components/common/Card';
import CategoryIcon from '../components/common/CategoryIcon';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Plus, Edit, Trash2 } from 'lucide-react';

const ManageCategoriesPage = ({ finTrackData, categoryModalControls }) => {
	const { categories, handleDeleteCategory } = finTrackData;
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
	const [activeTab, setActiveTab] = useState("expense");

	const handleDeleteRequest = (catName, type) => {
		setShowDeleteConfirm({ isOpen: true, title: "Delete Category", message: `Are you sure you want to delete the "${catName}" category? This cannot be undone.`, onConfirm: () => { handleDeleteCategory(catName, type); setShowDeleteConfirm(null); } });
	};

	const currentCategories = categories[activeTab] || {};

	return (
		<div className="p-4 md:p-6 space-y-6">
			<div className="flex border-b border-gray-200 dark:border-gray-700">
				<button onClick={() => setActiveTab("expense")} className={`px-4 py-2 text-sm font-medium ${activeTab === "expense" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500"}`}>Expense</button>
				<button onClick={() => setActiveTab("income")} className={`px-4 py-2 text-sm font-medium ${activeTab === "income" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500"}`}>Income</button>
			</div>
			<Card>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold capitalize">{activeTab} Categories</h3>
					<button type="button" onClick={() => categoryModalControls.open(null, activeTab)} className="p-2 bg-indigo-600 text-white rounded-md"><Plus className="h-5 w-5" /></button>
				</div>
				<div className="space-y-2">
					{Object.entries(currentCategories).map(([catName, { icon, color, type }]) => (
						<div key={catName} className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
							<div className="w-8 h-8 flex items-center justify-center rounded-full mr-3" style={{ backgroundColor: color }}><CategoryIcon name={icon} type={type} className="w-5 h-5 text-white" /></div>
							<span className="flex-grow">{catName}</span>
							<div className="flex items-center gap-2">
								<button type="button" onClick={() => categoryModalControls.edit({ id: catName, ...categories[activeTab][catName], categoryType: activeTab })} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit className="w-5 h-5 text-gray-500" /></button>
								<button type="button" onClick={() => handleDeleteRequest(catName, activeTab)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash2 className="w-5 h-5 text-red-500" /></button>
							</div>
						</div>
					))}
				</div>
			</Card>
			{showDeleteConfirm && (<ConfirmationModal {...showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} />)}
		</div>
	);
};

export default ManageCategoriesPage;
EOF

# --- src/pages/ManageRecurringPage.jsx ---
create_file src/pages/ManageRecurringPage.jsx <<'EOF'
import React, { useState } from 'react';
import Card from '../components/common/Card';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Plus, Edit, Trash2, Repeat } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const ManageRecurringPage = ({ finTrackData, recurringModalControls }) => {
	const { recurringTransactions, handleDeleteRecurringTransaction } = finTrackData;
	const [deleteConfirm, setDeleteConfirm] = useState(null);

	const handleDeleteRequest = (recTxId) => {
		const recTx = recurringTransactions.find((t) => t.id === recTxId);
		setDeleteConfirm({ isOpen: true, title: "Delete Recurring Transaction", message: `Are you sure you want to delete the recurring transaction "${recTx?.description}"?`, onConfirm: () => { handleDeleteRecurringTransaction(recTxId); setDeleteConfirm(null); } });
	};

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card>
				<div className="space-y-2">
					{recurringTransactions.map((recTx) => (
						<div key={recTx.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
							<div className="flex items-center gap-3">
								<Repeat className="w-5 h-5 text-indigo-500" />
								<div>
									<p className="font-semibold">{recTx.description}</p>
									<p className="text-sm text-gray-500 capitalize">{recTx.frequency} &bull; {formatCurrency(recTx.amount)}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<button type="button" onClick={() => recurringModalControls.edit(recTx)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit className="w-5 h-5 text-gray-500" /></button>
								<button type="button" onClick={() => handleDeleteRequest(recTx.id)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash2 className="w-5 h-5 text-red-500" /></button>
							</div>
						</div>
					))}
				</div>
			</Card>
			<button type="button" onClick={() => recurringModalControls.open()} className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Plus size={18} /> Add Recurring Transaction</button>
			{deleteConfirm && (<ConfirmationModal {...deleteConfirm} onClose={() => setDeleteConfirm(null)} />)}
		</div>
	);
};

export default ManageRecurringPage;
EOF

# --- src/pages/SettingsPage.jsx ---
create_file src/pages/SettingsPage.jsx <<'EOF'
import React from 'react';
import Card from '../components/common/Card';
import ManagementButton from '../components/common/ManagementButton';
import { currencyMap } from '../lib/constants';
import { Wallet, BarChart2, Repeat, Database } from 'lucide-react';

const AppearanceSettings = ({ theme, setTheme, currency, setCurrency, budgetDisplay, setBudgetDisplay }) => (
	<Card>
		<h3 className="text-lg font-semibold mb-4">Appearance</h3>
		<div className="space-y-4">
			<div>
				<label className="text-gray-700 dark:text-gray-300">Theme</label>
				<div className="flex justify-between items-center mt-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
					{["light", "dark", "system"].map((opt) => (<button key={opt} onClick={() => setTheme(opt)} className={`w-full text-center text-sm capitalize px-3 py-1 rounded-md transition-colors ${theme === opt ? "bg-white dark:bg-gray-600 shadow" : "text-gray-500 dark:text-gray-300"}`}>{opt}</button>))}
				</div>
			</div>
			<div className="flex items-center justify-between">
				<label htmlFor="currency-select" className="text-gray-700 dark:text-gray-300">Currency</label>
				<select id="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
					{Object.keys(currencyMap).map((key) => (<option key={key} value={key}>{key} ({currencyMap[key]})</option>))}
				</select>
			</div>
			<div>
				<label className="text-gray-700 dark:text-gray-300">Budget Display</label>
				<div className="flex justify-between items-center mt-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
					{["ratio", "remaining", "both"].map((opt) => (<button key={opt} onClick={() => setBudgetDisplay(opt)} className={`w-full text-center text-sm capitalize px-3 py-1 rounded-md transition-colors ${budgetDisplay === opt ? "bg-white dark:bg-gray-600 shadow" : "text-gray-500 dark:text-gray-300"}`}>{opt}</button>))}
				</div>
			</div>
		</div>
	</Card>
);

const GeneralSettings = ({ weekStartsOn, setWeekStartsOn, monthStartsOn, setMonthStartsOn }) => (
	<Card>
		<h3 className="text-lg font-semibold mb-4">General</h3>
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<label htmlFor="week-start-select" className="text-gray-700 dark:text-gray-300">Week Starts On</label>
				<select id="week-start-select" value={weekStartsOn} onChange={(e) => setWeekStartsOn(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
					<option value="Sunday">Sunday</option><option value="Monday">Monday</option><option value="Saturday">Saturday</option>
				</select>
			</div>
			<div className="flex items-center justify-between">
				<label htmlFor="month-start-input" className="text-gray-700 dark:text-gray-300">Month Start Day</label>
				<input id="month-start-input" type="number" value={monthStartsOn} onChange={(e) => setMonthStartsOn(parseInt(e.target.value, 10))} min="1" max="28" className="w-20 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
			</div>
		</div>
	</Card>
);

const SettingsPage = ({ theme, setTheme, currency, setCurrency, budgetDisplay, setBudgetDisplay, weekStartsOn, setWeekStartsOn, monthStartsOn, setMonthStartsOn, navigate, onDataManagementClick }) => {
	return (
		<div className="p-4 md:p-6 space-y-6">
			<AppearanceSettings theme={theme} setTheme={setTheme} currency={currency} setCurrency={setCurrency} budgetDisplay={budgetDisplay} setBudgetDisplay={setBudgetDisplay} />
			<GeneralSettings weekStartsOn={weekStartsOn} setWeekStartsOn={setWeekStartsOn} monthStartsOn={monthStartsOn} setMonthStartsOn={setMonthStartsOn} />
			<Card>
				<h3 className="text-lg font-semibold mb-4">Management</h3>
				<div className="space-y-3">
					<ManagementButton onClick={() => navigate("manageAccounts")} icon={Wallet} label="Manage Accounts" />
					<ManagementButton onClick={() => navigate("manageCategories")} icon={BarChart2} label="Manage Categories" />
					<ManagementButton onClick={() => navigate("manageRecurring")} icon={Repeat} label="Recurring Transactions" />
					<ManagementButton onClick={onDataManagementClick} icon={Database} label="Data Management" />
				</div>
			</Card>
			<div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">Version: 1.0.3</div>
		</div>
	);
};

export default SettingsPage;
EOF

# --- src/pages/TransactionsPage.jsx ---
create_file src/pages/TransactionsPage.jsx <<'EOF'
import React, { useState, useEffect, useMemo } from 'react';
import TransactionList from '../components/transactions/TransactionList';
import { useStickyState } from '../hooks/useStickyState';
import { formatCurrency, formatDateForInput, getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth, getStartOfYear, getEndOfYear, formatRangeLabel } from '../lib/utils';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const TransactionsPage = ({ finTrackData, txModalControls }) => {
	const { transactions, accounts, categories, currency } = finTrackData;
	const [filterPeriod, setFilterPeriod] = useStickyState("monthly", "fintrack-tx-filter-period");
	const [referenceDate, setReferenceDate] = useStickyState(new Date().toISOString(), "fintrack-tx-reference-date");
	const [filter, setFilter] = useState({ startDate: formatDateForInput(getStartOfMonth(new Date(referenceDate))), endDate: formatDateForInput(getEndOfMonth(new Date(referenceDate))), type: "all", accountId: "all" });

	useEffect(() => {
		if (filterPeriod === "custom") return;
		let start, end;
		const ref = new Date(referenceDate);
		switch (filterPeriod) {
			case "daily": start = getStartOfDay(ref); end = getEndOfDay(ref); break;
			case "weekly": start = getStartOfWeek(ref); end = getEndOfWeek(ref); break;
			case "annually": start = getStartOfYear(ref); end = getEndOfYear(ref); break;
			case "monthly": default: start = getStartOfMonth(ref); end = getEndOfMonth(ref); break;
		}
		setFilter((prev) => ({ ...prev, startDate: formatDateForInput(start), endDate: formatDateForInput(end) }));
	}, [filterPeriod, referenceDate]);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilter((prev) => ({ ...prev, [name]: value }));
	};
	const handlePeriodChange = (period) => {
		setFilterPeriod(period);
		if (period !== "custom") setReferenceDate(new Date().toISOString());
	};
	const handlePrev = () => {
		const newDate = new Date(referenceDate);
		switch (filterPeriod) {
			case "daily": newDate.setDate(newDate.getDate() - 1); break;
			case "weekly": newDate.setDate(newDate.getDate() - 7); break;
			case "monthly": newDate.setMonth(newDate.getMonth() - 1); break;
			case "annually": newDate.setFullYear(newDate.getFullYear() - 1); break;
			default: break;
		}
		setReferenceDate(newDate.toISOString());
	};
	const handleNext = () => {
		const newDate = new Date(referenceDate);
		switch (filterPeriod) {
			case "daily": newDate.setDate(newDate.getDate() + 1); break;
			case "weekly": newDate.setDate(newDate.getDate() + 7); break;
			case "monthly": newDate.setMonth(newDate.getMonth() + 1); break;
			case "annually": newDate.setFullYear(newDate.getFullYear() + 1); break;
			default: break;
		}
		setReferenceDate(newDate.toISOString());
	};

	const { filteredTransactions, totalIncome, totalExpenses } = useMemo(() => {
		const specialCategories = Object.keys(categories.special || {});
		let totalIncome = 0, totalExpenses = 0;
		const transactionsInPeriod = transactions.filter((tx) => tx.date >= filter.startDate && tx.date <= filter.endDate);
		transactionsInPeriod.forEach((tx) => {
			const toAccount = accounts.find((a) => a.id === tx.to);
			if (tx.type === "income" && !specialCategories.includes(tx.category)) totalIncome += tx.amount;
			else if (tx.type === "expense" && !specialCategories.includes(tx.category)) totalExpenses += tx.amount;
			else if (tx.type === "transfer") {
				if (toAccount?.type === "Liability") totalExpenses += tx.amount;
			}
		});
		const filteredTransactions = transactionsInPeriod.filter((tx) => {
			if (filter.accountId !== "all") {
				if (tx.type === "transfer") { if (tx.from !== filter.accountId && tx.to !== filter.accountId) return false; }
				else if (tx.accountId !== filter.accountId) return false;
			}
			if (filter.type === "all") return true;
			if (specialCategories.includes(tx.category)) return false;
			if (filter.type === "income") { if (tx.type === "income") return true; }
			if (filter.type === "expense") { if (tx.type === "expense") return true; }
			return tx.type === filter.type;
		});
		return { filteredTransactions, totalIncome, totalExpenses };
	}, [transactions, filter, categories, accounts]);

	return (
		<div className="space-y-6">
			<div className="bg-white dark:bg-gray-800 p-4 md:px-6 shadow-sm">
				<div className="relative flex justify-center items-center gap-2 mb-4">
					<button onClick={handlePrev} disabled={filterPeriod === "custom"} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-5 w-5" /></button>
					<span className="font-semibold text-center w-auto sm:w-48 flex-shrink-0">{formatRangeLabel(filterPeriod, new Date(referenceDate))}</span>
					<button onClick={handleNext} disabled={filterPeriod === "custom"} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-5 w-5" /></button>
					<button onClick={() => handlePeriodChange("custom")} className={`absolute top-0 right-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${filterPeriod === "custom" ? "text-indigo-600" : ""}`}><Filter size={20} /></button>
				</div>
				<div className="flex justify-center flex-wrap gap-2 mb-4 border-b dark:border-gray-700 pb-4">
					{["daily", "weekly", "monthly", "annually"].map((p) => (<button key={p} onClick={() => handlePeriodChange(p)} className={`px-3 py-1 text-sm rounded-full capitalize ${filterPeriod === p ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"}`}>{p}</button>))}
				</div>
				{filterPeriod === "custom" && (
					<div className="grid grid-cols-2 gap-4 items-end mb-4">
						<div>
							<label htmlFor="startDate" className="text-sm font-medium text-gray-600 dark:text-gray-300">Start Date</label>
							<input type="date" name="startDate" id="startDate" value={filter.startDate} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
						</div>
						<div>
							<label htmlFor="endDate" className="text-sm font-medium text-gray-600 dark:text-gray-300">End Date</label>
							<input type="date" name="endDate" id="endDate" value={filter.endDate} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
						</div>
					</div>
				)}
				<div className="grid grid-cols-2 gap-4 items-end">
					<div>
						<label htmlFor="type" className="text-sm font-medium text-gray-600 dark:text-gray-300">Type</label>
						<select name="type" id="type" value={filter.type} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							<option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option><option value="transfer">Transfer</option>
						</select>
					</div>
					<div>
						<label htmlFor="accountId" className="text-sm font-medium text-gray-600 dark:text-gray-300">Account</label>
						<select name="accountId" id="accountId" value={filter.accountId} onChange={handleFilterChange} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
							<option value="all">All Accounts</option>
							{accounts.map((acc) => (<option key={acc.id} value={acc.id}>{acc.name}</option>))}
						</select>
					</div>
				</div>
				<div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
					<div className="flex justify-around text-center">
						<div>
							<h3 className="text-sm text-gray-500 dark:text-gray-400">Total Income</h3>
							<p className="text-lg font-semibold text-green-500">{formatCurrency(totalIncome, currency)}</p>
						</div>
						<div>
							<h3 className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</h3>
							<p className="text-lg font-semibold text-red-500">{formatCurrency(totalExpenses, currency)}</p>
						</div>
					</div>
				</div>
			</div>
			<div className="p-4 md:p-6 md:pt-0">
				<TransactionList title="Transactions" transactions={filteredTransactions} txModalControls={txModalControls} accounts={accounts} categories={categories} currency={currency} contextAccountId={filter.accountId} />
			</div>
		</div>
	);
};

export default TransactionsPage;
EOF

# 3. Create the main App.jsx file
echo "Creating the main App.jsx file..."
create_file src/App.jsx <<'EOF'
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useFinTrack } from './hooks/useFinTrack';
import { useStickyState } from './hooks/useStickyState';
import { getStartOfDay, formatCurrency, updateStateAndDB } from './lib/utils'; // Assuming updateStateAndDB is moved
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';
import ErrorBannerSystem from './components/common/ErrorBannerSystem';
import TransactionModal from './components/modals/TransactionModal';
import BudgetModal from './components/modals/BudgetModal';
import AccountModal from './components/modals/AccountModal';
import CategoryModal from './components/modals/CategoryModal';
import RecurringTransactionModal from './components/modals/RecurringTransactionModal';
import DataManagementModal from './components/modals/DataManagementModal';
import ConfirmationModal from './components/common/ConfirmationModal';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import AccountsPage from './pages/AccountsPage';
import SettingsPage from './pages/SettingsPage';
import ManageAccountsPage from './pages/ManageAccountsPage';
import ManageCategoriesPage from './pages/ManageCategoriesPage';
import ManageRecurringPage from './pages/ManageRecurringPage';
import AccountDetailPage from './pages/AccountDetailPage';
import LoanDetailPage from './pages/LoanDetailPage';

export default function App() {
	const [activeView, setActiveView] = useState("dashboard");
	const [viewingAccountId, setViewingAccountId] = useState(null);
	const [viewHistory, setViewHistory] = useState(["dashboard"]);
	const finTrackData = useFinTrack();
	const [txModalState, setTxModalState] = useState({ open: false, edit: null, delete: null, isCorrection: false });
	const [budgetModalState, setBudgetModalState] = useState({ open: false, edit: null, delete: null });
	const [accountModalState, setAccountModalState] = useState({ open: false, edit: null });
	const [categoryModalState, setCategoryModalState] = useState({ open: false, edit: null, type: "expense" });
	const [recurringModalState, setRecurringModalState] = useState({ open: false, edit: null });
	const [isDataMgmtOpen, setDataMgmtOpen] = useState(false);
	const [theme, setTheme] = useStickyState("system", "fintrack-theme");
	const [currency, setCurrency] = useStickyState("PHP", "fintrack-currency");
	const [budgetDisplay, setBudgetDisplay] = useStickyState("both", "fintrack-budget-display");
	const [weekStartsOn, setWeekStartsOn] = useStickyState("Sunday", "fintrack-week-start");
	const [monthStartsOn, setMonthStartsOn] = useStickyState(1, "fintrack-month-start");
	const [errors, setErrors] = useState([]);

	useEffect(() => {
		if (finTrackData.isDbLoading) return;
		const checkLoanPayments = async () => {
			const today = getStartOfDay(new Date());
			const loans = finTrackData.accounts.filter((a) => a.type === "Loan");
			let updatedAccounts = [...finTrackData.accounts];
			let newNotifications = [];
			for (const loan of loans) {
				if (loan.interestCollectionFrequency === "End of Term") continue;
				const creationDate = new Date(loan.id.split("-")[1]);
				let lastPaymentDate = loan.lastProcessedDate ? getStartOfDay(new Date(loan.lastProcessedDate)) : getStartOfDay(creationDate);
				let nextDueDate = new Date(lastPaymentDate);
				const freq = loan.interestCollectionFrequency;
				if (freq === "Daily") nextDueDate.setDate(nextDueDate.getDate() + 1);
				if (freq === "Monthly") nextDueDate.setMonth(nextDueDate.getMonth() + 1);
				if (freq === "Yearly") nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
				if (today >= nextDueDate) {
					const interest = (loan.balance * (parseFloat(loan.interestRate) || 0)) / 100;
					let paymentDue = 0;
					if (freq === "Daily") paymentDue = interest / 365;
					if (freq === "Monthly") paymentDue = interest / 12;
					if (freq === "Yearly") paymentDue = interest;
					const accountIndex = updatedAccounts.findIndex((a) => a.id === loan.id);
					const updatedLoan = { ...updatedAccounts[accountIndex] };
					updatedLoan.overdueAmount = (updatedLoan.overdueAmount || 0) + paymentDue;
					updatedLoan.lastProcessedDate = formatDateForInput(today);
					updatedAccounts[accountIndex] = updatedLoan;
					newNotifications.push({ id: `notif-${loan.id}-${Date.now()}`, message: `Loan payment for "${loan.name}" is due. Overdue: ${formatCurrency(updatedLoan.overdueAmount, currency)}`, date: new Date().toISOString(), type: "warning", read: false });
				}
			}
			if (newNotifications.length > 0) {
				await updateStateAndDB("accounts", updatedAccounts, finTrackData.setAccounts);
				finTrackData.setNotifications((prev) => [...newNotifications, ...prev]);
			}
		};
		checkLoanPayments();
	}, [finTrackData.isDbLoading]);

	const handleLoanPayment = async (tx) => {
		if (tx.type === "income" && tx.category === "Loan Collection" && tx.accountId) {
			const db = await initDB();
			const loanAccount = await db.get("accounts", tx.accountId);
			if (loanAccount && loanAccount.type === "Loan") {
				const updatedLoan = { ...loanAccount, overdueAmount: 0, lastProcessedDate: tx.date };
				await db.put("accounts", updatedLoan);
			}
		}
	};

	const augmentedSaveTransaction = async (newTx) => {
		await finTrackData.handleSaveTransaction(newTx);
		await handleLoanPayment(newTx);
	};

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "light") root.classList.remove("dark");
		else if (theme === "dark") root.classList.add("dark");
		else {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			const handleSystemThemeChange = (e) => root.classList.toggle("dark", e.matches);
			handleSystemThemeChange(mediaQuery);
			mediaQuery.addEventListener("change", handleSystemThemeChange);
			return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
		}
	}, [theme]);

	useEffect(() => {
		let viewport = document.querySelector('meta[name="viewport"]');
		if (!viewport) {
			viewport = document.createElement("meta");
			viewport.name = "viewport";
			document.head.appendChild(viewport);
		}
		viewport.content = "width=device-width, initial-scale=1.0, viewport-fit=cover";
	}, []);

	const handleError = (message) => {
		setErrors((currentErrors) => {
			const existingError = currentErrors.find((e) => e.message === message);
			if (existingError && existingError.timerId) clearTimeout(existingError.timerId);
			const newTimerId = setTimeout(() => { setErrors((prev) => prev.filter((e) => e.message !== message)); }, 3000);
			if (existingError) return currentErrors.map((e) => e.message === message ? { ...e, count: e.count + 1, timerId: newTimerId } : e);
			else {
				const newError = { id: Date.now(), message, count: 1, timerId: newTimerId };
				const updatedErrors = [...currentErrors, newError].slice(-2);
				if (currentErrors.length >= 2 && currentErrors[0].timerId) clearTimeout(currentErrors[0].timerId);
				return updatedErrors;
			}
		});
	};

	const closeError = (id) => {
		setErrors((currentErrors) => {
			const errorToRemove = currentErrors.find((e) => e.id === id);
			if (errorToRemove && errorToRemove.timerId) clearTimeout(errorToRemove.timerId);
			return currentErrors.filter((e) => e.id !== id);
		});
	};

	const navigate = (view, entityId = null) => {
		if (view === "accountDetail" || view === "loanDetail") setViewingAccountId(entityId);
		setViewHistory((prev) => [...prev, view]);
		setActiveView(view);
	};

	const handleBack = () => {
		const newHistory = [...viewHistory];
		const currentView = newHistory.pop();
		if (currentView === "accountDetail" || currentView === "loanDetail") setViewingAccountId(null);
		setActiveView(newHistory[newHistory.length - 1] || "dashboard");
		setViewHistory(newHistory);
	};

	const navigateToTab = (view) => {
		setActiveView(view);
		setViewHistory([view]);
	};

	const openTxModal = (editTx = null) => {
		const isCorrection = editTx && (editTx.category === "Balance Correction" || editTx.category === "Balance Adjustment");
		setTxModalState({ open: true, edit: editTx, delete: null, isCorrection });
	};
	const closeTxModal = () => setTxModalState({ open: false, edit: null, delete: null, isCorrection: false });
	const txModalControls = { open: openTxModal, close: closeTxModal, edit: (tx) => openTxModal(tx), delete: (txId) => setTxModalState((prev) => ({ ...prev, open: true, delete: txId })) };

	const openBudgetModal = (editBudget = null) => setBudgetModalState({ open: true, edit: editBudget, delete: null });
	const closeBudgetModal = () => setBudgetModalState({ open: false, edit: null, delete: null });
	const budgetModalControls = { open: openBudgetModal, close: closeBudgetModal, edit: openBudgetModal, delete: (budgetId) => setBudgetModalState((prev) => ({ ...prev, delete: budgetId })), duplicate: finTrackData.handleDuplicateBudget };

	const openAccountModal = (editAccount = null) => setAccountModalState({ open: true, edit: editAccount });
	const closeAccountModal = () => setAccountModalState({ open: false, edit: null });
	const accountModalControls = { open: openAccountModal, close: closeAccountModal, edit: openAccountModal };

	const handleSaveCategory = (category) => {
		const newCats = JSON.parse(JSON.stringify(finTrackData.categories));
		const type = category.categoryType;
		if (category.originalId && category.originalId !== category.id) delete newCats[type][category.originalId];
		newCats[type][category.id] = { icon: category.icon, color: category.color, type: category.type };
		finTrackData.setCategories(newCats);
	};
	const handleDeleteCategory = (categoryId, type) => {
		const newCats = JSON.parse(JSON.stringify(finTrackData.categories));
		delete newCats[type][categoryId];
		finTrackData.setCategories(newCats);
	};
	const openCategoryModal = (editCategory = null, type = "expense") => setCategoryModalState({ open: true, edit: editCategory, type });
	const closeCategoryModal = () => setCategoryModalState({ open: false, edit: null, type: "expense" });
	const categoryModalControls = { open: openCategoryModal, close: closeCategoryModal, edit: openCategoryModal };

	const openRecurringModal = (editTx = null) => setRecurringModalState({ open: true, edit: editTx });
	const closeRecurringModal = () => setRecurringModalState({ open: false, edit: null });
	const recurringModalControls = { open: openRecurringModal, close: closeRecurringModal, edit: openRecurringModal };

	const pageTitles = { dashboard: "Dashboard", transactions: "Transactions", budgets: "Budgets", accounts: "Accounts", settings: "Settings", manageAccounts: "Manage Accounts", manageCategories: "Manage Categories", manageRecurring: "Recurring Transactions", accountDetail: "Account Details", loanDetail: "Loan Details" };
	const getPageTitle = () => {
		if ((activeView === "accountDetail" || activeView === "loanDetail") && viewingAccountId) {
			const account = finTrackData.accounts.find((a) => a.id === viewingAccountId);
			return account ? account.name : "Details";
		}
		return pageTitles[activeView] || "FinTrack";
	};

	const renderActiveView = () => {
		if (finTrackData.isDbLoading) return <div className="p-8 text-center">Loading Database...</div>;
		const props = { finTrackData: { ...finTrackData, currency, handleDeleteCategory }, txModalControls, budgetModalControls, accountModalControls, categoryModalControls, recurringModalControls, theme, setTheme, currency, setCurrency, budgetDisplay, setBudgetDisplay, weekStartsOn, setWeekStartsOn, monthStartsOn, setMonthStartsOn, onError: handleError, navigate };
		switch (activeView) {
			case "dashboard": return <DashboardPage {...props} />;
			case "transactions": return <TransactionsPage {...props} />;
			case "budgets": return <BudgetsPage {...props} />;
			case "accounts": return <AccountsPage {...props} />;
			case "settings": return <SettingsPage onDataManagementClick={() => setDataMgmtOpen(true)} {...props} />;
			case "manageAccounts": return <ManageAccountsPage {...props} />;
			case "manageCategories": return <ManageCategoriesPage {...props} />;
			case "manageRecurring": return <ManageRecurringPage {...props} />;
			case "accountDetail": {
				const account = finTrackData.accounts.find((a) => a.id === viewingAccountId);
				if (!account) return <div className="p-8 text-center">Account not found.</div>;
				return <AccountDetailPage account={account} {...props} />;
			}
			case "loanDetail": {
				const account = finTrackData.accounts.find((a) => a.id === viewingAccountId);
				if (!account) return <div className="p-8 text-center">Loan not found.</div>;
				return <LoanDetailPage account={account} {...props} />;
			}
			default: return <DashboardPage {...props} />;
		}
	};

	return (
		<div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
			<ErrorBannerSystem errors={errors} onClose={closeError} />
			<div className="relative flex">
				<Sidebar activeView={activeView} onTabClick={navigateToTab} />
				<div className="flex-1 flex flex-col w-full md:ml-64">
					<Header onSettingsClick={() => navigate("settings")} notifications={finTrackData.notifications} onClearNotifications={() => finTrackData.setNotifications([])} pageTitle={getPageTitle()} onBack={viewHistory.length > 1 ? handleBack : null} />
					<main className="pb-28 md:pb-6">{renderActiveView()}</main>
				</div>
			</div>
			<BottomNav activeView={activeView} onTabClick={navigateToTab} />
			{(activeView === "dashboard" || activeView === "transactions" || activeView === "accountDetail" || activeView === "loanDetail") && (<button type="button" onClick={() => openTxModal()} className="fixed bottom-24 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 z-10"><Plus size={24} /></button>)}
			<TransactionModal isOpen={txModalState.open && !txModalState.delete} onClose={closeTxModal} onSave={augmentedSaveTransaction} transactionToEdit={txModalState.edit} accounts={finTrackData.accounts} categories={finTrackData.categories} onError={handleError} isCorrectionMode={txModalState.isCorrection} />
			<ConfirmationModal isOpen={!!txModalState.delete} onClose={closeTxModal} onConfirm={() => { finTrackData.handleDeleteTransaction(txModalState.delete); closeTxModal(); }} title="Delete Transaction" message="Are you sure you want to delete this transaction?" />
			<BudgetModal isOpen={budgetModalState.open} onClose={closeBudgetModal} onSave={finTrackData.handleSaveBudget} budgetToEdit={budgetModalState.edit} masterCategories={finTrackData.categories} onError={handleError} />
			<ConfirmationModal isOpen={!!budgetModalState.delete} onClose={closeBudgetModal} onConfirm={() => { finTrackData.handleDeleteBudget(budgetModalState.delete); closeBudgetModal(); }} title="Delete Budget" message="Are you sure you want to delete this budget?" />
			<AccountModal isOpen={accountModalState.open} onClose={closeAccountModal} onSave={finTrackData.handleSaveAccount} onDelete={finTrackData.handleDeleteAccount} accountToEdit={accountModalState.edit} onSaveTransaction={augmentedSaveTransaction} onError={handleError} accounts={finTrackData.accounts} />
			<CategoryModal isOpen={categoryModalState.open} onClose={closeCategoryModal} onSave={handleSaveCategory} onDelete={handleDeleteCategory} categoryToEdit={categoryModalState.edit} categoryType={categoryModalState.type} onError={handleError} categories={finTrackData.categories} />
			<RecurringTransactionModal isOpen={recurringModalState.open} onClose={closeRecurringModal} onSave={finTrackData.handleSaveRecurringTransaction} transactionToEdit={recurringModalState.edit} accounts={finTrackData.accounts} categories={finTrackData.categories} onError={handleError} />
			<DataManagementModal isOpen={isDataMgmtOpen} onClose={() => setDataMgmtOpen(false)} finTrackData={finTrackData} onError={handleError} />
		</div>
	);
}
EOF

# 4. Clean up old App.css if it exists
if [ -f src/App.css ]; then
    echo "Removing old App.css..."
    rm src/App.css
fi

echo "Refactoring complete!"
echo "Please check the new file structure in the 'src' directory."
echo "You may need to restart your development server."
