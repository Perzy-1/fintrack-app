import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Calendar, DollarSign } from "lucide-react";
import { Card } from "./App";
import CalculatorInput from "./CalculatorInput";

const SavingsSettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  accounts,
  onSave, 
  onError,
  currency,
  formatCurrency
}) => {
  const [payDates, setPayDates] = useState([13, 28]);
  const [incomeMode, setIncomeMode] = useState("range");
  const [incomePerCutoff, setIncomePerCutoff] = useState({
    min: 13000,
    max: 13500,
    fixed: 13250
  });
  const [essentialsMode, setEssentialsMode] = useState("percentage");
  const [essentialsPercentage, setEssentialsPercentage] = useState(50);
  const [fixedBills, setFixedBills] = useState([]);
  const [accountRules, setAccountRules] = useState({});
  
  // New bill form state
  const [newBillName, setNewBillName] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillDueDate, setNewBillDueDate] = useState(1);
  
  const savingsAccounts = accounts.filter(acc => acc.type === "Savings");
  
  useEffect(() => {
    if (isOpen && settings) {
      setPayDates(settings.payDates || [13, 28]);
      setIncomeMode(settings.incomeMode || "range");
      setIncomePerCutoff(settings.incomePerCutoff || {
        min: 13000,
        max: 13500,
        fixed: 13250
      });
      setEssentialsMode(settings.essentialsMode || "percentage");
      setEssentialsPercentage(settings.essentialsPercentage || 50);
      setFixedBills(settings.fixedBills || []);
      setAccountRules(settings.accountRules || {});
    }
  }, [isOpen, settings]);
  
  const handleAddBill = () => {
    if (!newBillName.trim() || !newBillAmount || parseFloat(newBillAmount) <= 0) {
      onError("Please enter valid bill details.");
      return;
    }
    
    const newBill = {
      id: `bill-${Date.now()}`,
      name: newBillName.trim(),
      amount: parseFloat(newBillAmount),
      dueDate: newBillDueDate
    };
    
    setFixedBills([...fixedBills, newBill]);
    setNewBillName("");
    setNewBillAmount("");
    setNewBillDueDate(1);
  };
  
  const handleRemoveBill = (billId) => {
    setFixedBills(fixedBills.filter(bill => bill.id !== billId));
  };
  
  const handlePayDateChange = (index, value) => {
    const newPayDates = [...payDates];
    newPayDates[index] = parseInt(value) || 1;
    setPayDates(newPayDates);
  };
  
  const handleAddPayDate = () => {
    if (payDates.length < 4) {
      setPayDates([...payDates, 1]);
    }
  };
  
  const handleRemovePayDate = (index) => {
    if (payDates.length > 1) {
      const newPayDates = payDates.filter((_, i) => i !== index);
      setPayDates(newPayDates);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate income settings
    if (incomeMode === "fixed" && (!incomePerCutoff.fixed || incomePerCutoff.fixed <= 0)) {
      onError("Please enter a valid fixed income amount.");
      return;
    }
    
    if (incomeMode === "range" && (!incomePerCutoff.min || !incomePerCutoff.max || 
        incomePerCutoff.min <= 0 || incomePerCutoff.max <= 0 || 
        incomePerCutoff.min > incomePerCutoff.max)) {
      onError("Please enter valid income range values.");
      return;
    }
    
    if (essentialsMode === "percentage" && (essentialsPercentage <= 0 || essentialsPercentage > 100)) {
      onError("Essentials percentage must be between 1 and 100.");
      return;
    }
    
    const newSettings = {
      id: "main",
      payDates: payDates.sort((a, b) => a - b),
      incomeMode,
      incomePerCutoff,
      essentialsMode,
      essentialsPercentage,
      fixedBills,
      accountRules
    };
    
    onSave(newSettings);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Savings Settings</h2>
          <button type="button" onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pay Dates Section */}
          <div>
            <h3 className="text-md font-semibold mb-3 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Pay Dates (Cutoffs)
            </h3>
            <div className="space-y-2">
              {payDates.map((date, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={date}
                    onChange={(e) => handlePayDateChange(index, e.target.value)}
                    className="w-20 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Day of the month
                  </span>
                  {payDates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePayDate(index)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {payDates.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddPayDate}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Pay Date
                </button>
              )}
            </div>
          </div>
          
          {/* Income Settings */}
          <div>
            <h3 className="text-md font-semibold mb-3 flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Income per Cutoff
            </h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Income Mode</label>
              <select
                value={incomeMode}
                onChange={(e) => setIncomeMode(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="range">Range (Min-Max)</option>
                <option value="average">Calculate from Transactions</option>
              </select>
            </div>
            
            {incomeMode === "fixed" && (
              <div>
                <label className="block text-sm font-medium mb-1">Fixed Income Amount</label>
                <CalculatorInput
                  value={incomePerCutoff.fixed?.toString() || ""}
                  onChange={(e) => setIncomePerCutoff({
                    ...incomePerCutoff,
                    fixed: parseFloat(e.target.value) || 0
                  })}
                  placeholder="0.00"
                />
              </div>
            )}
            
            {incomeMode === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum</label>
                  <CalculatorInput
                    value={incomePerCutoff.min?.toString() || ""}
                    onChange={(e) => setIncomePerCutoff({
                      ...incomePerCutoff,
                      min: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Maximum</label>
                  <CalculatorInput
                    value={incomePerCutoff.max?.toString() || ""}
                    onChange={(e) => setIncomePerCutoff({
                      ...incomePerCutoff,
                      max: parseFloat(e.target.value) || 0
                    })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
            
            {incomeMode === "average" && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md text-sm">
                Income will be calculated automatically based on your actual transaction history.
              </div>
            )}
          </div>
          
          {/* Essentials Section */}
          <div>
            <h3 className="text-md font-semibold mb-3">Monthly Essentials</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Calculation Mode</label>
              <select
                value={essentialsMode}
                onChange={(e) => setEssentialsMode(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="percentage">Percentage of Income</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            
            {essentialsMode === "percentage" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Essentials Percentage ({essentialsPercentage}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={essentialsPercentage}
                  onChange={(e) => setEssentialsPercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10%</span>
                  <span>50%</span>
                  <span>90%</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Fixed Bills Section */}
          <div>
            <h3 className="text-md font-semibold mb-3">Fixed Monthly Bills</h3>
            
            {fixedBills.length > 0 && (
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {fixedBills.map((bill) => (
                  <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <div>
                      <span className="font-medium">{bill.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        Due: {bill.dueDate}th
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {formatCurrency(bill.amount, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBill(bill.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add new bill form */}
            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Bill name"
                  value={newBillName}
                  onChange={(e) => setNewBillName(e.target.value)}
                  className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <CalculatorInput
                  value={newBillAmount}
                  onChange={(e) => setNewBillAmount(e.target.value)}
                  placeholder="Amount"
                />
                <select
                  value={newBillDueDate}
                  onChange={(e) => setNewBillDueDate(parseInt(e.target.value))}
                  className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}th</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddBill}
                className="w-full md:w-auto px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Bill
              </button>
            </div>
          </div>
          
          {/* Savings Accounts Assignment */}
          {savingsAccounts.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-3">Default Savings Account</h3>
              <select
                value={accountRules.defaultSavingsAccount || ""}
                onChange={(e) => setAccountRules({
                  ...accountRules,
                  defaultSavingsAccount: e.target.value
                })}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select default savings account...</option>
                {savingsAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({formatCurrency(account.balance, currency)})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This account will be used by default when adding progress to savings goals.
              </p>
            </div>
          )}
          
          <div className="flex justify-between pt-6 border-t dark:border-gray-600">
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
              Save Settings
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SavingsSettingsModal;
