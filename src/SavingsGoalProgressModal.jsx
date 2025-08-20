import React, { useState, useEffect } from "react";
import { X, ArrowRightLeft, PiggyBank } from "lucide-react";
import { Card } from "./App";
import CalculatorInput from "./CalculatorInput";

// Modal component to add progress to a savings goal with automatic transaction creation
const SavingsGoalProgressModal = ({ 
  isOpen, 
  onClose, 
  goal, 
  accounts, 
  onSaveTransaction,
  onUpdateGoal, 
  onError,
  currency,
  formatCurrency
}) => {
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [createTransaction, setCreateTransaction] = useState(true);
  const [description, setDescription] = useState("");
  
  // Filter for savings accounts only
  const savingsAccounts = accounts.filter(acc => acc.type === "Savings");
  
  useEffect(() => {
    if (isOpen) {
      // Initialize form with defaults when opened
      setAmount("");
      setAccountId(savingsAccounts.length > 0 ? savingsAccounts[0].id : "");
      setCreateTransaction(true);
      setDescription(`Progress for ${goal?.name || "goal"}`);
    }
  }, [isOpen, goal, savingsAccounts]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      onError("Please enter a valid amount.");
      return;
    }
    
    if (createTransaction && !accountId) {
      onError("Please select an account.");
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    
    // Create updated goal object
    const updatedGoal = {
      ...goal,
      allocatedAmount: (goal.allocatedAmount || 0) + parsedAmount,
    };
    
    // Check if goal is now completed
    if (updatedGoal.allocatedAmount >= goal.targetAmount) {
      updatedGoal.isCompleted = true;
      updatedGoal.completedDate = new Date().toISOString().split('T')[0];
    }
    
    // Create transaction if needed
    if (createTransaction) {
      const transaction = {
        id: `tx-${Date.now()}`,
        accountId: accountId,
        amount: parsedAmount,
        type: "expense",
        category: "Savings",
        date: new Date().toISOString().split('T')[0],
        description: description,
        // Add reference to the goal
        goalId: goal.id
      };
      
      // Save the transaction
      onSaveTransaction(transaction);
    }
    
    // Update the goal
    onUpdateGoal(updatedGoal);
    
    // Close the modal
    onClose();
  };
  
  if (!isOpen) return null;
  
  const remainingAmount = goal.targetAmount - (goal.allocatedAmount || 0);
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Add Progress to {goal.name}
          </h2>
          <button type="button" onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Target:</span>
            <span className="font-medium">{formatCurrency(goal.targetAmount, currency)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current progress:</span>
            <span className="font-medium">{formatCurrency(goal.allocatedAmount || 0, currency)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Remaining:</span>
            <span className="font-medium">{formatCurrency(Math.max(0, remainingAmount), currency)}</span>
          </div>
          
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${remainingAmount <= 0 ? 'bg-green-500' : 'bg-indigo-600'}`}
              style={{ width: `${Math.min(((goal.allocatedAmount || 0) / goal.targetAmount) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Progress Amount
            </label>
            <CalculatorInput
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              id="create-transaction"
              type="checkbox"
              checked={createTransaction}
              onChange={(e) => setCreateTransaction(e.target.checked)}
              className="w-4 h-4 text-indigo-600"
            />
            <label htmlFor="create-transaction" className="text-sm font-medium">
              Create transaction record
            </label>
          </div>
          
          {createTransaction && (
            <>
              <div>
                <label htmlFor="account" className="block text-sm font-medium mb-1">
                  From Account
                </label>
                {savingsAccounts.length > 0 ? (
                  <select
                    id="account"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  >
                    {savingsAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({formatCurrency(account.balance, currency)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md text-sm">
                    <p>No savings accounts available. The transaction will be recorded without affecting any account balance.</p>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </>
          )}
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Add Progress
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SavingsGoalProgressModal;
