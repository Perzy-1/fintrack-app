import React, { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useFinTrack } from './hooks/useFinTrack';
import { useIsMobile } from './hooks/useIsMobile';
import { useStickyState } from './hooks/useStickyState';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import TransactionModal from './components/modals/TransactionModal';
import RecurringTransactionModal from './components/modals/RecurringTransactionModal';
import DataManagementModal from './components/modals/DataManagementModal';
import ErrorBannerSystem from './components/common/ErrorBannerSystem';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import BudgetsPage from './pages/BudgetsPage';
import SettingsPage from './pages/SettingsPage';
import AccountDetailPage from './pages/AccountDetailPage';
import LoanDetailPage from './pages/LoanDetailPage';
import ManageAccountsPage from './pages/ManageAccountsPage';
import ManageCategoriesPage from './pages/ManageCategoriesPage';
import ManageRecurringPage from './pages/ManageRecurringPage';

function App() {
  const {
    isLoading,
    accounts,
    transactions,
    categories,
    budgets,
    recurringTransactions,
    currency,
    setCurrency,
    error,
    errorCount,
    addError,
    clearError,
    txModalControls,
    recurringModalControls
  } = useFinTrack();

  // Persisted UI settings used by the Settings page
  const [theme, setTheme] = useStickyState('system', 'fintrack-theme');
  const [budgetDisplay, setBudgetDisplay] = useStickyState('ratio', 'fintrack-budget-display');
  const [weekStartsOn, setWeekStartsOn] = useStickyState('Sunday', 'fintrack-week-start');
  const [monthStartsOn, setMonthStartsOn] = useStickyState(1, 'fintrack-month-start');

  const isMobile = useIsMobile();

  // Basic calculated data for the dashboard (net worth, assets, etc.)
  const calculatedData = useMemo(() => {
    const assetTypes = ['Debit Card', 'Credit Card', 'Savings', 'Cash'];
    const totalAssets = accounts
      .filter((a) => assetTypes.includes(a.type))
      .reduce((sum, a) => sum + a.balance, 0);
    const totalLoans = accounts
      .filter((a) => a.type === 'Loan')
      .reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = accounts
      .filter((a) => a.type === 'Liability')
      .reduce((sum, a) => sum + a.balance, 0);
    return {
      totalAssets,
      totalLoans,
      totalLiabilities,
      netWorth: totalAssets + totalLoans - totalLiabilities,
    };
  }, [accounts]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg font-semibold text-gray-500">Loading FinTrack...</p>
      </div>
    );
  }

  // Stub handlers for features that haven't been wired up yet. These
  // functions prevent runtime errors when the corresponding UI actions are
  // triggered and surface a helpful message instead.
  const handleDeleteAccount = async () => addError('Account deletion is not yet implemented.');
  const handleDeleteCategory = () => addError('Category deletion is not yet implemented.');
  const handleDeleteRecurringTransaction = () => addError('Recurring transaction deletion is not yet implemented.');

  const accountModalControls = { open: () => addError('Account modal is not yet implemented.') };
  const budgetModalControls = { open: () => addError('Budget modal is not yet implemented.') };
  const categoryModalControls = {
    open: () => addError('Category modal is not yet implemented.'),
    edit: () => addError('Category modal is not yet implemented.'),
  };

  const finTrackData = {
    accounts,
    transactions,
    categories,
    budgets,
    recurringTransactions,
    currency,
    calculatedData,
    handleDeleteAccount,
    handleDeleteCategory,
    handleDeleteRecurringTransaction,
  };

  const pageProps = {
    finTrackData,
    txModalControls,
    recurringModalControls,
    accountModalControls,
    budgetModalControls,
    categoryModalControls,
  };

  const [isDataModalOpen, setDataModalOpen] = useState(false);

  const accountRoutes = accounts.map((account) => {
    const PageComponent = account.type === 'loan' ? LoanDetailPage : AccountDetailPage;
    return (
      <Route
        key={account.id}
        path={`/accounts/${account.id}`}
        element={<PageComponent account={account} {...pageProps} />}
      />
    );
  });

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="flex h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 md:pl-64">
        {!isMobile && <Sidebar />}
        <div className="flex flex-1 flex-col">
          <Header />
          <ErrorBannerSystem error={error} clearError={clearError} key={errorCount} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            <Routes>
              <Route path="/" element={<DashboardPage {...pageProps} />} />
              <Route path="/transactions" element={<TransactionsPage {...pageProps} />} />
              <Route path="/accounts" element={<AccountsPage {...pageProps} />} />
              <Route path="/budgets" element={<BudgetsPage {...pageProps} budgetDisplay={budgetDisplay} />} />
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    theme={theme}
                    setTheme={setTheme}
                    currency={currency}
                    setCurrency={setCurrency}
                    budgetDisplay={budgetDisplay}
                    setBudgetDisplay={setBudgetDisplay}
                    weekStartsOn={weekStartsOn}
                    setWeekStartsOn={setWeekStartsOn}
                    monthStartsOn={monthStartsOn}
                    setMonthStartsOn={setMonthStartsOn}
                    onDataManagementClick={() => setDataModalOpen(true)}
                  />
                }
              />
              <Route path="/manage/accounts" element={<ManageAccountsPage {...pageProps} />} />
              <Route path="/manage/categories" element={<ManageCategoriesPage {...pageProps} />} />
              <Route path="/manage/recurring" element={<ManageRecurringPage {...pageProps} />} />
              {accountRoutes}
            </Routes>
          </main>
          <TransactionModal {...txModalControls} accounts={accounts} categories={categories} currency={currency} addError={addError} />
          <RecurringTransactionModal {...recurringModalControls} accounts={accounts} categories={categories} currency={currency} addError={addError} />
          <DataManagementModal isOpen={isDataModalOpen} onClose={() => setDataModalOpen(false)} finTrackData={finTrackData} onError={addError} />
        </div>
        {isMobile && <BottomNav />}
      </div>
    </Router>
  );
}

export default App;
