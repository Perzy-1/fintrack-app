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
