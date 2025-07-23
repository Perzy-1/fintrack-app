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
