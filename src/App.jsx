import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useFinTrack } from './hooks/useFinTrack';
import { useStickyState } from './hooks/useStickyState';
import { getStartOfDay, formatCurrency, formatDateForInput } from './lib/utils';
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
import { initDB } from './lib/db';

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
				await finTrackData.updateStateAndDB("accounts", updatedAccounts, finTrackData.setAccounts);
				finTrackData.setNotifications((prev) => [...newNotifications, ...prev]);
			}
		};
		checkLoanPayments();
	}, [finTrackData.isDbLoading, finTrackData.accounts, finTrackData.setAccounts, finTrackData.setNotifications, finTrackData.updateStateAndDB, currency]);

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
