#!/bin/bash

# --- Automated Fix Script for FinTrack App ---
# This script reverts the database import statement in the useFinTrack hook
# to the correct named import syntax. This is the opposite of the previous
# incorrect fix.

# --- Helper Functions ---
function create_file {
  # Create directory if it doesn't exist
  mkdir -p "$(dirname "$1")"
  # Create the file with the content
  cat > "$1"
}

# --- Main Execution ---
echo "Reverting to the correct database import..."

# 1. Update src/hooks/useFinTrack.js to use the correct named import syntax.
echo "Fixing the import statement in src/hooks/useFinTrack.js..."
create_file src/hooks/useFinTrack.js <<'EOF'
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
    const recurring = await db.recurring.toArray();

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
    recurring = [],
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
    recurring,
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
EOF

echo "The import statement has been corrected."
echo "Please restart the development server. We should be in the clear now."