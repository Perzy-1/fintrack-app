import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
// Reverted to the correct named import.
import { db } from '../lib/db';
import { useStickyState } from './useStickyState';
import { addMonths, startOfMonth, endOfMonth, differenceInCalendarMonths } from 'date-fns';

export function useFinTrack() {
  const [currency, setCurrency] = useStickyState('USD', 'fintrack-currency');

  const finTrackData = useLiveQuery(async () => {
    const accounts = await db.accounts.toArray();
    const transactions = await db.transactions.toArray();
    const categories = await db.categories.toArray();
    const budgets = await db.budgets.toArray();
    const recurring = await db.recurringTransactions.toArray();

    // Return the loaded data directly. "recurring" is already the array of
    // recurring transactions, so expose it under the same name to keep the
    // shape consistent with how the rest of the application expects it.
    return {
      accounts,
      transactions,
      categories,
      budgets,
      recurring,
    };
  }, []);

  const isLoading = finTrackData === undefined;

  const {
    accounts = [],
    transactions = [],
    categories = [],
    budgets = [],
    recurring: recurringTransactions = [],
  } = finTrackData || {};

  const [error, setError] = useState(null);
  const [errorCount, setErrorCount] = useState(0);

  const addError = useCallback((message) => {
    const newError = { id: Date.now(), message };
    setError(newError);
    setErrorCount((prev) => prev + 1);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const [isTxModalOpen, setTxModalOpen] = useState(false);
  const [isRecurringModalOpen, setRecurringModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);

  const txModalControls = {
    open: (tx = null) => {
      setEditingTransaction(tx);
      setTxModalOpen(true);
    },
    close: () => {
      setEditingTransaction(null);
      setTxModalOpen(false);
    },
    isOpen: isTxModalOpen,
    editingTransaction,
  };

  const recurringModalControls = {
    open: (tx = null) => {
      setEditingRecurring(tx);
      setRecurringModalOpen(true);
    },
    close: () => {
      setEditingRecurring(null);
      setRecurringModalOpen(false);
    },
    isOpen: isRecurringModalOpen,
    editingRecurring,
  };

  return {
    isLoading,
    accounts,
    transactions,
    categories,
    budgets,
    recurring: recurringTransactions,
    currency,
    setCurrency,
    error,
    errorCount,
    addError,
    clearError,
    txModalControls,
    recurringModalControls
  };
}
