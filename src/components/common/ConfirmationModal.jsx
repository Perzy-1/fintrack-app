import React from 'react';
import Card from './Card';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", children }) => {
	if (!isOpen) return null;
	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<Card className="w-full max-w-sm">
				<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h2>
				<p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
				{children}
				<div className="flex justify-end space-x-3 mt-4">
					<button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600">Cancel</button>
					<button type="button" onClick={onConfirm} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">{confirmText}</button>
				</div>
			</Card>
		</div>
	);
};

export default ConfirmationModal;
