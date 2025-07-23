import { useState, useEffect, useMemo, useRef } from 'react';
import { MoreVertical, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency, getStartOfMonth, getEndOfMonth } from '../../lib/utils';

const AccountItem = ({ account, transactions, accountModalControls, currency, onDelete, navigate }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const { income, expenses } = useMemo(() => {
		const now = new Date();
		const startOfMonth = getStartOfMonth(now);
		const endOfMonth = getEndOfMonth(now);
		let income = 0, expenses = 0;
		transactions
			.filter((tx) => {
				const txDate = new Date(`${tx.date}T00:00:00`);
				const isRelated = tx.accountId === account.id || tx.to === account.id || tx.from === account.id;
				return isRelated && txDate >= startOfMonth && txDate <= endOfMonth;
			})
			.forEach((tx) => {
				const isCorrection = tx.category === "Balance Correction" || tx.category === "Balance Adjustment";
				if (tx.type === "income" && tx.accountId === account.id && !isCorrection) {
					income += tx.amount;
				} else if (tx.type === "expense" && tx.accountId === account.id && !isCorrection) {
					expenses += tx.amount;
				} else if (tx.type === "transfer") {
					if (tx.to === account.id) income += tx.amount;
					if (tx.from === account.id) expenses += tx.amount + (tx.fee || 0);
				}
			});
		return { income, expenses };
	}, [account.id, transactions]);

	const handleNavigation = () => {
		if (account.type === "Loan") {
			navigate("loanDetail", account.id);
		} else {
			navigate("accountDetail", account.id);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			handleNavigation();
		}
	};

	const isOverdue = account.type === "Loan" && account.overdueAmount > 0;

	return (
		<div className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
			<div
				className="flex-grow cursor-pointer"
				onClick={handleNavigation}
				onKeyDown={handleKeyDown}
				role="button"
				tabIndex="0"
			>
				<div className="flex justify-between items-center p-3 md:p-4 w-full">
					<div className="flex items-center gap-2">
						{isOverdue && <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
						<div>
							<p className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-100">{account.name}</p>
							<p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{account.type}</p>
						</div>
					</div>
					<div className="text-right">
						<p className="text-base md:text-lg font-bold text-gray-800 dark:text-gray-100">{formatCurrency(account.balance, currency)}</p>
						<p className="text-xs text-gray-400">
							<span className="text-green-500">+{formatCurrency(income, currency)}</span>
							<span className="text-red-500 ml-2">-{formatCurrency(expenses, currency)}</span>
						</p>
					</div>
				</div>
			</div>
			<div className="relative pr-2 md:pr-4" ref={menuRef}>
				<button type="button" onClick={() => setMenuOpen((o) => !o)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
					<MoreVertical size={20} />
				</button>
				{menuOpen && (
					<div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20">
						<button type="button" onClick={() => { accountModalControls.edit(account); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
							<Edit size={16} className="mr-2" /> Edit
						</button>
						<button type="button" onClick={() => { onDelete(account.id); setMenuOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600">
							<Trash2 size={16} className="mr-2" /> Delete
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default AccountItem;
