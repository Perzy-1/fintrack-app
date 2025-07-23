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
