import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useFinTrack } from './hooks/useFinTrack';
import { useIsMobile } from './hooks/useIsMobile';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import BottomNav from './components/common/BottomNav';
import TransactionModal from './components/modals/TransactionModal';
import RecurringTransactionModal from './components/modals/RecurringTransactionModal';
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
    recurring,
    currency,
    setCurrency,
    error,
    errorCount,
    addError,
    clearError,
    txModalControls,
    recurringModalControls
  } = useFinTrack();

  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg font-semibold text-gray-500">Loading FinTrack...</p>
      </div>
    );
  }

  const pageProps = {
    accounts,
    transactions,
    categories,
    budgets,
    recurring,
    currency,
    txModalControls,
    recurringModalControls,
    addError
  };

  const accountRoutes = accounts.map((account) => {
    const PageComponent = account.type === 'loan' ? LoanDetailPage : AccountDetailPage;
    return (
      <Route
        key={account.id}
        path={`/accounts/${account.id}`}
        element={<PageComponent {...pageProps} />}
      />
    );
  });

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        {!isMobile && <Sidebar />}
        <div className="flex flex-1 flex-col">
          <Header />
          <ErrorBannerSystem error={error} clearError={clearError} key={errorCount} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            <Routes>
              <Route path="/" element={<DashboardPage {...pageProps} />} />
              <Route path="/transactions" element={<TransactionsPage {...pageProps} />} />
              <Route path="/accounts" element={<AccountsPage {...pageProps} />} />
              <Route path="/budgets" element={<BudgetsPage {...pageProps} addError={addError} />} />
              <Route path="/settings" element={<SettingsPage currency={currency} setCurrency={setCurrency} addError={addError} />} />
              <Route path="/manage/accounts" element={<ManageAccountsPage addError={addError} />} />
              <Route path="/manage/categories" element={<ManageCategoriesPage addError={addError} />} />
              <Route path="/manage/recurring" element={<ManageRecurringPage {...pageProps} />} />
              {accountRoutes}
            </Routes>
          </main>
          <TransactionModal {...txModalControls} accounts={accounts} categories={categories} currency={currency} addError={addError} />
          <RecurringTransactionModal {...recurringModalControls} accounts={accounts} categories={categories} currency={currency} addError={addError} />
        </div>
        {isMobile && <BottomNav />}
      </div>
    </Router>
  );
}

export default App;
