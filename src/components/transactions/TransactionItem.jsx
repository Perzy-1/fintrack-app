import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MoreVertical, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon';
import { formatCurrency } from '../../lib/utils';

const TransactionItem = ({ tx, txModalControls, accounts, categories, currency, contextAccountId }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuRef]);

	const info = useMemo(() => {
		if (tx.category === "Balance Correction" || tx.category === "Balance Adjustment") {
			const account = accounts.find((a) => a.id === tx.accountId);
			return { icon: "PiggyBank", color: tx.type === "income" ? "text-green-500" : "text-red-500", title: tx.description || "Balance Adjustment", subtitle: account ? account.name : "Modified Bal.", iconType: "icon", amountPrefix: tx.type === "income" ? "+" : "-" };
		}
		if (tx.type === "transfer") {
			const fromAccountName = accounts.find((a) => a.id === tx.from)?.name || "Unknown";
			const toAccountName = accounts.find((a) => a.id === tx.to)?.name || "Unknown";
			const subtitle = `From ${fromAccountName} to ${toAccountName}`;
			const title = tx.description || "Transfer";
			let color = "text-blue-500", amountPrefix = "";
			if (contextAccountId && contextAccountId !== "all") {
				if (tx.to === contextAccountId) { color = "text-green-500"; amountPrefix = "+"; }
				else if (tx.from === contextAccountId) { color = "text-red-500"; amountPrefix = "-"; }
			}
			return { icon: ArrowRightLeft, color, title, subtitle, amountPrefix };
		}
		const categoryInfo = (categories[tx.type] && categories[tx.type][tx.category]) || (categories.special && categories.special[tx.category]);
		return { icon: categoryInfo?.icon || "DollarSign", color: tx.type === "income" ? "text-green-500" : "text-red-500", title: tx.description || tx.category, subtitle: tx.category, iconType: categoryInfo?.type, amountPrefix: tx.type === "income" ? "+" : "-" };
	}, [tx, accounts, categories, contextAccountId]);

	return (
		<div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50">
			<div className="flex items-center space-x-4 flex-1">
				<div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
					<CategoryIcon name={info.icon} type={info.iconType} className={`h-6 w-6 ${info.color}`} />
				</div>
				<div>
					<p className="font-semibold">{info.title}</p>
					<p className="text-sm text-gray-500">{info.subtitle}</p>
				</div>
			</div>
			<div className="flex items-center space-x-2">
				<div className="text-right">
					<p className={`font-semibold ${info.color}`}>{info.amountPrefix}{formatCurrency(tx.amount, currency)}</p>
					<p className="text-sm text-gray-500">{new Date(tx.date + "T00:00:00").toLocaleDateString()}</p>
				</div>
				<div className="relative" ref={menuRef}>
					<button type="button" onClick={() => setMenuOpen((o) => !o)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><MoreVertical size={20} /></button>
					{menuOpen && (
						<div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20">
							<button type="button" onClick={() => { txModalControls.edit(tx); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"><Edit size={16} className="mr-2" /> Edit</button>
							<button type="button" onClick={() => { txModalControls.delete(tx.id); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"><Trash2 size={16} className="mr-2" /> Delete</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TransactionItem;
