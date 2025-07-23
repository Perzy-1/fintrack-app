import React, { useState } from 'react';
import Card from '../components/common/Card';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { Plus, Edit, Trash2, Repeat } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const ManageRecurringPage = ({ finTrackData, recurringModalControls }) => {
	const { recurringTransactions, handleDeleteRecurringTransaction } = finTrackData;
	const [deleteConfirm, setDeleteConfirm] = useState(null);

	const handleDeleteRequest = (recTxId) => {
		const recTx = recurringTransactions.find((t) => t.id === recTxId);
		setDeleteConfirm({ isOpen: true, title: "Delete Recurring Transaction", message: `Are you sure you want to delete the recurring transaction "${recTx?.description}"?`, onConfirm: () => { handleDeleteRecurringTransaction(recTxId); setDeleteConfirm(null); } });
	};

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card>
				<div className="space-y-2">
					{recurringTransactions.map((recTx) => (
						<div key={recTx.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
							<div className="flex items-center gap-3">
								<Repeat className="w-5 h-5 text-indigo-500" />
								<div>
									<p className="font-semibold">{recTx.description}</p>
									<p className="text-sm text-gray-500 capitalize">{recTx.frequency} &bull; {formatCurrency(recTx.amount)}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<button type="button" onClick={() => recurringModalControls.edit(recTx)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit className="w-5 h-5 text-gray-500" /></button>
								<button type="button" onClick={() => handleDeleteRequest(recTx.id)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash2 className="w-5 h-5 text-red-500" /></button>
							</div>
						</div>
					))}
				</div>
			</Card>
			<button type="button" onClick={() => recurringModalControls.open()} className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Plus size={18} /> Add Recurring Transaction</button>
			{deleteConfirm && (<ConfirmationModal {...deleteConfirm} onClose={() => setDeleteConfirm(null)} />)}
		</div>
	);
};

export default ManageRecurringPage;
