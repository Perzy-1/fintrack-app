import React, { useState, useEffect, useMemo } from "react";
import {
	Home,
	BarChart2,
	Wallet,
	Settings,
	DollarSign,
	Plus,
	ArrowRightLeft,
	PiggyBank,
	Bell,
	X,
	MoreVertical,
	Edit,
	Trash2,
	RefreshCw,
	AlertTriangle,
	CheckCircle,
	Car,
	ShoppingCart,
	Clapperboard,
	Wifi,
	Home as HomeIcon,
	Briefcase,
	Gift,
	Plane,
	Users,
	Lock,
	Sun,
	Moon,
	Menu,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
} from "recharts";

// --- DEFAULT DATA & CONFIG ---
const getStartOfMonth = (date = new Date()) =>
	new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
const getEndOfMonth = (date = new Date()) =>
	new Date(date.getFullYear(), date.getMonth() + 1, 0)
		.toISOString()
		.split("T")[0];

const initialAccounts = [
	{ id: "acc-1", name: "Main Checking", type: "Debit Card", balance: 4855 },
	{ id: "acc-2", name: "Vacation Fund", type: "Savings", balance: 1200 },
	{ id: "acc-3", name: "Emergency Fund", type: "Savings", balance: 3500 },
	{ id: "acc-4", name: "Cash on Hand", type: "Cash", balance: 150 },
	{ id: "acc-5", name: "Loan to Alex", type: "Friends", balance: 50 },
];
const iconMap = {
	Car,
	ShoppingCart,
	Clapperboard,
	Wifi,
	HomeIcon,
	Briefcase,
	Gift,
	Plane,
	Users,
	DollarSign,
	PiggyBank,
};
const defaultCategories = {
	Food: { icon: "ShoppingCart", color: "#EF4444" },
	Transport: { icon: "Car", color: "#3B82F6" },
	Entertainment: { icon: "Clapperboard", color: "#8B5CF6" },
	Utilities: { icon: "Wifi", color: "#F97316" },
	Rent: { icon: "HomeIcon", color: "#10B981" },
	Salary: { icon: "Briefcase", color: "#22C55E" },
	Gift: { icon: "Gift", color: "#EC4899" },
	Travel: { icon: "Plane", color: "#14B8A6" },
	"Personal Loans": { icon: "Users", color: "#78716C" },
	"Balance Correction": {
		icon: "PiggyBank",
		color: "#64748B",
		isProtected: true,
	},
};
const initialBudgets = [
	{
		id: "bud-1",
		name: "Monthly Expenses",
		period: "Monthly",
		startDate: getStartOfMonth(),
		endDate: getEndOfMonth(),
		categories: {
			Food: 400,
			Transport: 150,
			Entertainment: 200,
			Utilities: 150,
			Rent: 1500,
		},
		notificationThreshold: 0.8,
	},
];
const initialTransactions = [
	{
		id: "tx-1",
		accountId: "acc-1",
		type: "income",
		amount: 5000,
		category: "Salary",
		date: getStartOfMonth(),
		description: "Monthly Salary",
	},
	{
		id: "tx-2",
		accountId: "acc-1",
		type: "expense",
		amount: 85,
		category: "Food",
		date: new Date().toISOString().split("T")[0],
		description: "Groceries",
	},
	{
		id: "tx-3",
		accountId: "acc-1",
		type: "expense",
		amount: 60,
		category: "Utilities",
		date: new Date().toISOString().split("T")[0],
		description: "Internet Bill",
	},
];
const initialNotifications = [];

// --- HELPER COMPONENTS ---
const CategoryIcon = ({ name, className, ...props }) => {
	const IconComponent = iconMap[name] || DollarSign;
	return <IconComponent className={className} {...props} />;
};
const Card = ({ children, className = "" }) => (
	<div
		className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 ${className}`}
	>
		{children}
	</div>
);
const useStickyState = (defaultValue, key) => {
	const [value, setValue] = useState(() => {
		try {
			const stickyValue = localStorage.getItem(key);
			return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
		} catch {
			return defaultValue;
		}
	});
	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);
	return [value, setValue];
};

// --- CORE LOGIC HOOK ---
const useFinTrack = () => {
	const [accounts, setAccounts] = useStickyState(
		initialAccounts,
		"fintrack-accounts",
	);
	const [budgets, setBudgets] = useStickyState(
		initialBudgets,
		"fintrack-budgets",
	);
	const [transactions, setTransactions] = useStickyState(
		initialTransactions,
		"fintrack-transactions",
	);
	const [notifications, setNotifications] = useStickyState(
		initialNotifications,
		"fintrack-notifications",
	);
	const [categories, setCategories] = useStickyState(
		defaultCategories,
		"fintrack-categories",
	);

	useEffect(() => {
		const today = new Date();
		const updatedBudgets = budgets.map((budget) => {
			if (budget.period === "Monthly") {
				const endDate = new Date(budget.endDate);
				if (endDate < today && endDate.getMonth() !== today.getMonth()) {
					return {
						...budget,
						startDate: getStartOfMonth(today),
						endDate: getEndOfMonth(today),
					};
				}
			}
			return budget;
		});
		if (JSON.stringify(updatedBudgets) !== JSON.stringify(budgets)) {
			setBudgets(updatedBudgets);
		}
	}, [budgets, setBudgets]);

	const calculatedData = useMemo(() => {
		const currentBalances = accounts.reduce((acc, account) => {
			let balance = account.balance;
			transactions.forEach((tx) => {
				if (tx.accountId === account.id) {
					if (tx.type === "income") balance += tx.amount;
					else if (tx.type === "expense") balance -= tx.amount;
				} else if (tx.type === "transfer") {
					if (tx.from === account.id) balance -= tx.amount + (tx.fee || 0);
					if (tx.to === account.id) balance += tx.amount;
				}
			});
			acc[account.id] = balance;
			return acc;
		}, {});
		const totalBalance = Object.values(currentBalances).reduce(
			(sum, b) => sum + b,
			0,
		);
		return { accountBalances: currentBalances, totalBalance };
	}, [accounts, transactions]);

	const handleSaveTransaction = (newTx) => {
		setTransactions((prevTx) => {
			const index = prevTx.findIndex((t) => t.id === newTx.id);
			if (index > -1) {
				const updated = [...prevTx];
				updated[index] = newTx;
				return updated;
			} else {
				return [...prevTx, newTx];
			}
		});
	};
	const handleDeleteTransaction = (txId) => {
		setTransactions((prev) => prev.filter((t) => t.id !== txId));
	};
	const handleSaveBudget = (newBudget) => {
		setBudgets((prev) => {
			const index = prev.findIndex((b) => b.id === newBudget.id);
			if (index > -1) {
				const updated = [...prev];
				updated[index] = newBudget;
				return updated;
			} else {
				return [...prev, newBudget];
			}
		});
	};
	const handleDeleteBudget = (budgetId) => {
		setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
	};
	const handleSaveAccount = (newAccount) => {
		setAccounts((prev) => {
			const index = prev.findIndex((a) => a.id === newAccount.id);
			if (index > -1) {
				const updated = [...prev];
				updated[index] = newAccount;
				return updated;
			} else {
				return [...prev, newAccount];
			}
		});
	};
	const handleDeleteAccount = (accountId) => {
		setAccounts((prev) => prev.filter((a) => a.id !== accountId));
	};

	return {
		accounts,
		setAccounts,
		budgets,
		setBudgets,
		transactions,
		setTransactions,
		notifications,
		setNotifications,
		categories,
		setCategories,
		calculatedData,
		handleSaveTransaction,
		handleDeleteTransaction,
		handleSaveBudget,
		handleDeleteBudget,
		handleSaveAccount,
		handleDeleteAccount,
	};
};

// --- UI COMPONENTS ---
const Header = ({
	onSettingsClick,
	notifications,
	onClearNotifications,
	pageTitle,
	onMenuClick,
}) => {
	const [panelOpen, setPanelOpen] = useState(false);
	const unreadCount = notifications.filter((n) => !n.read).length;
	return (
		<header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-20">
			{" "}
			<div className="flex items-center">
				{" "}
				<button
					type="button"
					onClick={onMenuClick}
					className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
				>
					{" "}
					<Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />{" "}
				</button>{" "}
				<h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
					{pageTitle}
				</h1>{" "}
			</div>{" "}
			<div className="flex items-center space-x-2 md:space-x-4">
				{" "}
				<div className="relative">
					{" "}
					<button
						type="button"
						onClick={() => setPanelOpen(!panelOpen)}
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
					>
						{" "}
						<Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />{" "}
						{unreadCount > 0 && (
							<span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
						)}{" "}
					</button>{" "}
					{panelOpen && (
						<div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-20">
							{" "}
							<div className="p-3 flex justify-between items-center border-b dark:border-gray-600">
								{" "}
								<h4 className="font-semibold text-gray-800 dark:text-white">
									Notifications
								</h4>{" "}
								{notifications.length > 0 && (
									<button
										type="button"
										onClick={() => {
											onClearNotifications();
											setPanelOpen(false);
										}}
										className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
									>
										Clear all
									</button>
								)}{" "}
							</div>{" "}
							<div className="max-h-80 overflow-y-auto">
								{" "}
								{notifications.length > 0 ? (
									notifications.map((n) => (
										<div
											key={n.id}
											className="p-3 flex items-start space-x-3 border-b dark:border-gray-600 last:border-b-0"
										>
											{" "}
											{n.type === "warning" ? (
												<AlertTriangle className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
											) : (
												<CheckCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
											)}{" "}
											<div>
												{" "}
												<p className="text-sm text-gray-700 dark:text-gray-200">
													{n.message}
												</p>{" "}
												<p className="text-xs text-gray-400 dark:text-gray-500">
													{new Date(n.date).toLocaleString()}
												</p>{" "}
											</div>{" "}
										</div>
									))
								) : (
									<p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
										No new notifications.
									</p>
								)}{" "}
							</div>{" "}
						</div>
					)}{" "}
				</div>{" "}
				<button
					type="button"
					onClick={onSettingsClick}
					className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					<Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
				</button>{" "}
			</div>{" "}
		</header>
	);
};
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
			{" "}
			<Card className="w-full max-w-sm">
				{" "}
				<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
					{title}
				</h2>{" "}
				<p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>{" "}
				<div className="flex justify-end space-x-3">
					{" "}
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600"
					>
						Cancel
					</button>{" "}
					<button
						type="button"
						onClick={onConfirm}
						className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
					>
						Confirm
					</button>{" "}
				</div>{" "}
			</Card>{" "}
		</div>
	);
};
const BottomNav = ({ activeView, setActiveView }) => {
	const navItems = [
		{ name: "Dashboard", icon: Home, view: "dashboard" },
		{ name: "Budgets", icon: BarChart2, view: "budgets" },
		{ name: "Accounts", icon: Wallet, view: "accounts" },
		{ name: "Settings", icon: Settings, view: "settings" },
	];
	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around p-2 z-20 md:hidden">
			{" "}
			{navItems.map((item) => (
				<button
					type="button"
					key={item.name}
					onClick={() => setActiveView(item.view)}
					className={`flex flex-col items-center space-y-1 w-20 ${activeView === item.view ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}
				>
					{" "}
					<item.icon className="h-6 w-6" />{" "}
					<span className="text-xs">{item.name}</span>{" "}
				</button>
			))}{" "}
		</div>
	);
};
const Sidebar = ({
	activeView,
	setActiveView,
	isDrawerOpen,
	setIsDrawerOpen,
	autoHideMenu,
}) => {
	const navItems = [
		{ name: "Dashboard", icon: Home, view: "dashboard" },
		{ name: "Budgets", icon: BarChart2, view: "budgets" },
		{ name: "Accounts", icon: Wallet, view: "accounts" },
		{ name: "Settings", icon: Settings, view: "settings" },
	];
	return (
		<>
			{" "}
			<div
				className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				{" "}
				<h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">
					FinTrack
				</h2>{" "}
				<nav className="flex flex-col space-y-2">
					{" "}
					{navItems.map((item) => (
						<button
							type="button"
							key={item.name}
							onClick={() => {
								setActiveView(item.view);
								if (autoHideMenu) setIsDrawerOpen(false);
							}}
							className={`flex items-center space-x-3 p-3 rounded-lg ${activeView === item.view ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
						>
							{" "}
							<item.icon className="h-6 w-6" /> <span>{item.name}</span>{" "}
						</button>
					))}{" "}
				</nav>{" "}
			</div>{" "}
			{isDrawerOpen && (
				<div
					onClick={() => setIsDrawerOpen(false)}
					className="fixed inset-0 bg-black/30 z-30"
				/>
			)}{" "}
		</>
	);
};
const TransactionModal = ({
	isOpen,
	onClose,
	onSave,
	transactionToEdit,
	accounts,
	categories,
}) => {
	const [type, setType] = useState("expense");
	const [accountId, setAccountId] = useState(accounts[0]?.id || "");
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState(Object.keys(categories)[0] || "");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [description, setDescription] = useState("");
	const [fromAccount, setFromAccount] = useState(accounts[0]?.id || "");
	const [toAccount, setToAccount] = useState(accounts[1]?.id || "");
	const [fee, setFee] = useState("");
	const isEditMode = !!transactionToEdit;

	useEffect(() => {
		if (isOpen) {
			const defaults = {
				type: "expense",
				accountId: accounts[0]?.id || "",
				amount: "",
				category: Object.keys(categories)[0] || "",
				date: new Date().toISOString().split("T")[0],
				description: "",
				fromAccount: accounts[0]?.id || "",
				toAccount: accounts[1]?.id || "",
				fee: "",
			};
			const initial = isEditMode
				? {
						...defaults,
						...transactionToEdit,
						amount: transactionToEdit.amount.toString(),
						fee: transactionToEdit.fee?.toString() || "",
					}
				: defaults;
			setType(initial.type);
			setAccountId(initial.accountId);
			setAmount(initial.amount);
			setCategory(initial.category);
			setDate(initial.date);
			setDescription(initial.description);
			setFromAccount(initial.from || initial.fromAccount);
			setToAccount(initial.to || initial.toAccount);
			setFee(initial.fee);
		}
	}, [isOpen, isEditMode, transactionToEdit, accounts, categories]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!amount || parseFloat(amount) <= 0) {
			console.error("Please enter a valid amount.");
			return;
		}
		const newTx = {
			id: isEditMode ? transactionToEdit.id : `tx-${Date.now()}`,
			amount: parseFloat(amount),
			date,
			description,
			type,
		};
		if (type === "transfer") {
			if (fromAccount === toAccount) {
				console.error("Cannot transfer to the same account.");
				return;
			}
			newTx.from = fromAccount;
			newTx.to = toAccount;
			if (fee) newTx.fee = parseFloat(fee);
		} else {
			newTx.accountId = accountId;
			newTx.category = category;
		}
		onSave(newTx);
		onClose();
	};

	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
			{" "}
			<Card className="w-full max-w-md">
				{" "}
				<div className="flex justify-between items-center mb-4">
					{" "}
					<h2 className="text-lg font-semibold">
						{isEditMode ? "Edit" : "Add"} Transaction
					</h2>{" "}
					<button type="button" onClick={onClose}>
						<X className="h-6 w-6" />
					</button>{" "}
				</div>{" "}
				<form onSubmit={handleSubmit} className="space-y-4">
					{" "}
					<div>
						<label htmlFor="tx-type">Type</label>
						<select
							id="tx-type"
							value={type}
							onChange={(e) => setType(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						>
							<option value="expense">Expense</option>
							<option value="income">Income</option>
							<option value="transfer">Transfer</option>
						</select>
					</div>{" "}
					{type === "transfer" ? (
						<>
							{" "}
							<div>
								<label htmlFor="tx-from">From</label>
								<select
									id="tx-from"
									value={fromAccount}
									onChange={(e) => setFromAccount(e.target.value)}
									className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
								>
									{accounts.map((a) => (
										<option key={a.id} value={a.id}>
											{a.name}
										</option>
									))}
								</select>
							</div>{" "}
							<div>
								<label htmlFor="tx-to">To</label>
								<select
									id="tx-to"
									value={toAccount}
									onChange={(e) => setToAccount(e.target.value)}
									className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
								>
									{accounts.map((a) => (
										<option key={a.id} value={a.id}>
											{a.name}
										</option>
									))}
								</select>
							</div>{" "}
							<div>
								<label htmlFor="tx-fee">Fee (Optional)</label>
								<input
									id="tx-fee"
									type="number"
									value={fee}
									onChange={(e) => setFee(e.target.value)}
									className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
									placeholder="0.00"
								/>
							</div>
						</>
					) : (
						<>
							{" "}
							<div>
								<label htmlFor="tx-account">Account</label>
								<select
									id="tx-account"
									value={accountId}
									onChange={(e) => setAccountId(e.target.value)}
									className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
								>
									{accounts.map((a) => (
										<option key={a.id} value={a.id}>
											{a.name}
										</option>
									))}
								</select>
							</div>{" "}
							<div>
								<label htmlFor="tx-category">Category</label>
								<select
									id="tx-category"
									value={category}
									onChange={(e) => setCategory(e.target.value)}
									className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
								>
									{Object.keys(categories)
										.filter((c) => c !== "Balance Correction")
										.map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
								</select>
							</div>{" "}
						</>
					)}{" "}
					<div>
						<label htmlFor="tx-amount">Amount</label>
						<input
							id="tx-amount"
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
							placeholder="0.00"
						/>
					</div>{" "}
					<div>
						<label htmlFor="tx-desc">Description</label>
						<input
							id="tx-desc"
							type="text"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						/>
					</div>{" "}
					<div>
						<label htmlFor="tx-date">Date</label>
						<input
							id="tx-date"
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						/>
					</div>{" "}
					<button
						type="submit"
						className="w-full bg-indigo-600 text-white font-semibold p-3 rounded-lg hover:bg-indigo-700"
					>
						{isEditMode ? "Save Changes" : "Add Transaction"}
					</button>{" "}
				</form>{" "}
			</Card>{" "}
		</div>
	);
};
const BudgetModal = ({
	isOpen,
	onClose,
	onSave,
	budgetToEdit,
	masterCategories,
}) => {
	const [name, setName] = useState("");
	const [period, setPeriod] = useState("Monthly");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [categories, setCategories] = useState({});
	const [selectedCat, setSelectedCat] = useState(
		Object.keys(masterCategories)[0],
	);
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
				setStartDate(getStartOfMonth());
				setEndDate(getEndOfMonth());
				setCategories({});
			}
		}
	}, [isOpen, isEditMode, budgetToEdit]);

	useEffect(() => {
		if (period === "Monthly") {
			setStartDate(getStartOfMonth());
			setEndDate(getEndOfMonth());
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
		if (!name || Object.keys(categories).length === 0) {
			console.error("Please provide a name and at least one category.");
			return;
		}
		onSave({
			id: isEditMode ? budgetToEdit.id : `bud-${Date.now()}`,
			name,
			period,
			startDate,
			endDate,
			categories,
			notificationThreshold: 0.8,
		});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
			<Card className="w-full max-w-lg">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">
						{isEditMode ? "Edit" : "Create"} Budget
					</h2>
					<button type="button" onClick={onClose}>
						<X className="h-6 w-6" />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="budget-name">Budget Name</label>
						<input
							id="budget-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						/>
					</div>
					<div>
						<label htmlFor="budget-period">Period</label>
						<select
							id="budget-period"
							value={period}
							onChange={(e) => setPeriod(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						>
							<option>Monthly</option>
							<option>Custom</option>
						</select>
					</div>
					{period === "Custom" && (
						<div className="flex gap-2">
							<div>
								<label htmlFor="budget-start">Start Date</label>
								<input
									id="budget-start"
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
								/>
							</div>
							<div>
								<label htmlFor="budget-end">End Date</label>
								<input
									id="budget-end"
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
								/>
							</div>
						</div>
					)}
					<div className="border-t pt-4 dark:border-gray-600">
						<h4 className="font-semibold mb-2">Budget Categories</h4>
						<div className="space-y-2 mb-2 max-h-32 overflow-y-auto">
							{Object.entries(categories).map(([cat, lim]) => (
								<div
									key={cat}
									className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md"
								>
									<span>{cat}</span>
									<span>${lim.toFixed(2)}</span>
									<button
										type="button"
										onClick={() => handleRemoveCategory(cat)}
									>
										<Trash2 className="w-4 h-4 text-red-500" />
									</button>
								</div>
							))}
						</div>
						<div className="flex gap-2 items-end">
							<div className="flex-grow">
								<label htmlFor="budget-cat-select" className="text-sm">
									Category
								</label>
								<select
									id="budget-cat-select"
									value={selectedCat}
									onChange={(e) => setSelectedCat(e.target.value)}
									className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
								>
									{Object.keys(masterCategories)
										.filter((c) => c !== "Balance Correction")
										.map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
								</select>
							</div>
							<div className="w-24">
								<label htmlFor="budget-cat-limit" className="text-sm">
									Limit
								</label>
								<input
									id="budget-cat-limit"
									type="number"
									value={limit}
									onChange={(e) => setLimit(e.target.value)}
									className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
								/>
							</div>
							<button
								type="button"
								onClick={handleAddCategory}
								className="p-2 bg-gray-200 dark:bg-gray-600 rounded-md"
							>
								<Plus className="h-5 w-5" />
							</button>
						</div>
					</div>
					<button
						type="submit"
						className="w-full bg-indigo-600 text-white font-semibold p-3 rounded-lg hover:bg-indigo-700"
					>
						{isEditMode ? "Save Changes" : "Create Budget"}
					</button>
				</form>
			</Card>
		</div>
	);
};

const AccountModal = ({
	isOpen,
	onClose,
	onSave,
	onDelete,
	accountToEdit,
	calculatedBalance,
	onSaveTransaction,
}) => {
	const [name, setName] = useState("");
	const [type, setType] = useState("Debit Card");
	const [balance, setBalance] = useState("");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const isEditMode = !!accountToEdit;

	useEffect(() => {
		if (isOpen) {
			if (isEditMode) {
				setName(accountToEdit.name);
				setType(accountToEdit.type);
				setBalance(calculatedBalance.toFixed(2));
			} else {
				setName("");
				setType("Debit Card");
				setBalance("");
			}
			setShowDeleteConfirm(false);
		}
	}, [isOpen, isEditMode, accountToEdit, calculatedBalance]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name || balance === "") return;

		const newBalance = parseFloat(balance);

		if (isEditMode) {
			const balanceDifference = newBalance - calculatedBalance;
			if (Math.abs(balanceDifference) > 0.001) {
				const correctionTx = {
					id: `tx-${Date.now()}`,
					accountId: accountToEdit.id,
					type: balanceDifference > 0 ? "income" : "expense",
					amount: Math.abs(balanceDifference),
					category: "Balance Correction",
					date: new Date().toISOString().split("T")[0],
					description: "Manual balance correction",
				};
				onSaveTransaction(correctionTx);
			}
			onSave({ ...accountToEdit, name, type });
		} else {
			onSave({ id: `acc-${Date.now()}`, name, type, balance: newBalance });
		}
		onClose();
	};

	const handleDelete = () => {
		onDelete(accountToEdit.id);
		setShowDeleteConfirm(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
			<Card className="w-full max-w-md">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-lg font-semibold">
						{isEditMode ? "Edit Account" : "Add Account"}
					</h2>
					<button type="button" onClick={onClose}>
						<X className="h-6 w-6" />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="acc-name">Account Name</label>
						<input
							id="acc-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						/>
					</div>
					<div>
						<label htmlFor="acc-type">Account Type</label>
						<select
							id="acc-type"
							value={type}
							onChange={(e) => setType(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						>
							<option>Debit Card</option>
							<option>Credit Card</option>
							<option>Savings</option>
							<option>Cash</option>
							<option>Friends</option>
						</select>
					</div>
					<div>
						<label htmlFor="acc-balance">
							{isEditMode ? "Corrected Balance" : "Initial Balance"}
						</label>
						<input
							id="acc-balance"
							value={balance}
							onChange={(e) => setBalance(e.target.value)}
							type="number"
							step="0.01"
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						/>
					</div>
					<div className="flex justify-between items-center pt-4">
						{isEditMode && (
							<button
								type="button"
								onClick={() => setShowDeleteConfirm(true)}
								className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
							>
								Delete
							</button>
						)}
						<div className="flex-grow" />
						<button
							type="submit"
							className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
						>
							{isEditMode ? "Save Changes" : "Add Account"}
						</button>
					</div>
				</form>
			</Card>
			<ConfirmationModal
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDelete}
				title="Delete Account"
				message={`Are you sure you want to delete the "${accountToEdit?.name}" account? This action cannot be undone.`}
			/>
		</div>
	);
};

const CategoryModal = ({
	isOpen,
	onClose,
	onSave,
	onDelete,
	categoryToEdit,
}) => {
	const [name, setName] = useState("");
	const [originalName, setOriginalName] = useState("");
	const [icon, setIcon] = useState("DollarSign");
	const [color, setColor] = useState("#8884d8");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const isEditMode = !!categoryToEdit;

	useEffect(() => {
		if (isOpen) {
			if (isEditMode) {
				setName(categoryToEdit.id);
				setOriginalName(categoryToEdit.id);
				setIcon(categoryToEdit.icon);
				setColor(categoryToEdit.color);
			} else {
				setName("");
				setOriginalName("");
				setIcon("DollarSign");
				setColor("#8884d8");
			}
			setShowDeleteConfirm(false);
		}
	}, [isOpen, isEditMode, categoryToEdit]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!name) return;
		onSave({
			id: name,
			originalId: originalName,
			icon,
			color,
		});
		onClose();
	};

	const handleDelete = () => {
		onDelete(originalName);
		setShowDeleteConfirm(false);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
			<Card className="w-full max-w-md">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-lg font-semibold">
						{isEditMode ? "Edit Category" : "Add Category"}
					</h2>
					<button type="button" onClick={onClose}>
						<X className="h-6 w-6" />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="cat-name">Category Name</label>
						<input
							id="cat-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						/>
					</div>
					<div>
						<label htmlFor="cat-icon">Icon</label>
						<select
							id="cat-icon"
							value={icon}
							onChange={(e) => setIcon(e.target.value)}
							className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
						>
							{Object.keys(iconMap).map((i) => (
								<option key={i} value={i}>
									{i}
								</option>
							))}
						</select>
					</div>
					<div>
						<label htmlFor="cat-color">Color</label>
						<input
							id="cat-color"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							type="color"
							className="p-1 h-10 w-full block bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-700 cursor-pointer rounded-lg"
						/>
					</div>
					<div className="flex justify-between items-center pt-4">
						{isEditMode && (
							<button
								type="button"
								onClick={() => setShowDeleteConfirm(true)}
								className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
							>
								Delete
							</button>
						)}
						<div className="flex-grow" />
						<button
							type="submit"
							className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
						>
							{isEditMode ? "Save Changes" : "Add Category"}
						</button>
					</div>
				</form>
			</Card>
			<ConfirmationModal
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDelete}
				title="Delete Category"
				message={`Are you sure you want to delete the "${categoryToEdit?.id}" category? This cannot be undone.`}
			/>
		</div>
	);
};

// --- PAGES & PAGE-SPECIFIC COMPONENTS ---
const DashboardPage = ({ finTrackData, txModalControls }) => {
	const { transactions, budgets, calculatedData, categories, accounts } =
		finTrackData;
	const { income, expenses, net } = useMemo(() => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		let income = 0,
			expenses = 0;
		transactions
			.filter(
				(tx) =>
					new Date(tx.date) >= startOfMonth && new Date(tx.date) <= endOfMonth,
			)
			.forEach((tx) => {
				if (tx.type === "income") income += tx.amount;
				else if (tx.type === "expense") expenses += tx.amount;
			});
		return { income, expenses, net: income - expenses };
	}, [transactions]);

	return (
		<div className="p-4 md:p-6 space-y-6">
			<Card className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="text-center">
					<h2 className="text-sm font-medium text-gray-500">Month's Income</h2>
					<p className="text-xl font-semibold text-green-500">
						${income.toFixed(2)}
					</p>
				</div>
				<div className="text-center">
					<h2 className="text-sm font-medium text-gray-500">
						Month's Expenses
					</h2>
					<p className="text-xl font-semibold text-red-500">
						${expenses.toFixed(2)}
					</p>
				</div>
				<div className="text-center">
					<h2 className="text-sm font-medium text-gray-500">Monthly Net</h2>
					<p
						className={`text-xl font-semibold ${net >= 0 ? "text-green-500" : "text-red-500"}`}
					>
						${net.toFixed(2)}
					</p>
				</div>
			</Card>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<SpendingAnalysis
					transactions={transactions}
					budget={budgets.find(
						(b) =>
							new Date(b.startDate) <= new Date() &&
							new Date(b.endDate) >= new Date(),
					)}
					categories={categories}
				/>
				<FutureProjection
					transactions={transactions}
					currentBalance={calculatedData.totalBalance}
				/>
			</div>
			<TransactionList
				transactions={[...transactions]
					.sort((a, b) => new Date(b.date) - new Date(a.date))
					.slice(0, 5)}
				txModalControls={txModalControls}
				accounts={accounts}
				categories={categories}
			/>
		</div>
	);
};

const SpendingAnalysis = ({ transactions, budget, categories }) => {
	const analysisData = useMemo(() => {
		if (!budget) return [];
		const expensesByCategory = transactions
			.filter(
				(tx) =>
					tx.type === "expense" &&
					new Date(tx.date) >= new Date(budget.startDate) &&
					new Date(tx.date) <= new Date(budget.endDate),
			)
			.reduce((acc, tx) => {
				acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
				return acc;
			}, {});
		return Object.keys(budget.categories).map((category) => ({
			name: category,
			spent: expensesByCategory[category] || 0,
			budget: budget.categories[category],
			fill: categories[category]?.color || "#8884d8",
		}));
	}, [transactions, budget, categories]);

	if (!budget)
		return (
			<Card>
				<h2 className="text-lg font-semibold mb-4">Spending Analysis</h2>
				<p>No active budget for the current period.</p>
			</Card>
		);

	return (
		<Card>
			<h2 className="text-lg font-semibold mb-4">
				Spending Analysis: {budget.name}
			</h2>
			<div style={{ width: "100%", height: 300 }}>
				<ResponsiveContainer>
					<BarChart
						data={analysisData}
						margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" tick={{ fontSize: 12 }} />
						<YAxis />
						<Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
						<Legend />
						<Bar dataKey="budget" name="Budget" fill="#e2e8f0" stackId="a" />
						<Bar dataKey="spent" name="Spent" stackId="a">
							{analysisData.map((entry) => (
								<Cell key={entry.name} fill={entry.fill} />
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</Card>
	);
};

const FutureProjection = ({ transactions, currentBalance }) => {
	const projection = useMemo(() => {
		const today = new Date();
		const thirtyDaysAgo = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate() - 30,
		);
		const recentExpenses = transactions.filter(
			(t) => new Date(t.date) >= thirtyDaysAgo && t.type === "expense",
		);
		if (recentExpenses.length === 0)
			return { weekly: 0, monthly: 0, endOfMonthBalance: currentBalance };
		const totalSpent = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
		const dailyAvg = totalSpent / 30;
		const daysInMonth = new Date(
			today.getFullYear(),
			today.getMonth() + 1,
			0,
		).getDate();
		const daysRemaining = daysInMonth - today.getDate();
		const weeklyProjection = dailyAvg * 7;
		const restOfMonthProjection = dailyAvg * daysRemaining;
		const endOfMonthBalance = currentBalance - restOfMonthProjection;
		return {
			weekly: weeklyProjection,
			monthly: restOfMonthProjection,
			endOfMonthBalance,
		};
	}, [transactions, currentBalance]);

	return (
		<Card>
			<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
				Future Projection
			</h2>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-500">
						Est. spending next 7 days:
					</span>
					<span className="font-semibold">
						~${projection.weekly.toFixed(2)}
					</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-500">
						Est. spending rest of month:
					</span>
					<span className="font-semibold">
						~${projection.monthly.toFixed(2)}
					</span>
				</div>
				<div className="border-t dark:border-gray-700 my-2"></div>
				<div className="flex justify-between items-center">
					<span className="font-semibold">Projected End-of-Month Balance:</span>
					<span
						className={`text-xl font-bold ${projection.endOfMonthBalance >= 0 ? "text-green-500" : "text-red-500"}`}
					>
						${projection.endOfMonthBalance.toFixed(2)}
					</span>
				</div>
			</div>
			<p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
				Based on spending over the last 30 days.
			</p>
		</Card>
	);
};

const TransactionList = ({
	transactions,
	txModalControls,
	accounts,
	categories,
}) => (
	<Card>
		{" "}
		<h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>{" "}
		<div className="space-y-4">
			{" "}
			{transactions.length > 0 ? (
				transactions.map((tx) => (
					<TransactionItem
						key={tx.id}
						tx={tx}
						txModalControls={txModalControls}
						accounts={accounts}
						categories={categories}
					/>
				))
			) : (
				<p className="text-center text-gray-500">No transactions yet.</p>
			)}{" "}
		</div>{" "}
	</Card>
);
const TransactionItem = ({ tx, txModalControls, accounts, categories }) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const info = useMemo(() => {
		if (tx.type === "transfer") {
			const from = accounts.find((a) => a.id === tx.from)?.name;
			const to = accounts.find((a) => a.id === tx.to)?.name;
			return {
				icon: ArrowRightLeft,
				color: "text-blue-500",
				title: tx.description || `Transfer`,
				subtitle: `From ${from} to ${to}`,
			};
		}
		const categoryInfo = categories[tx.category] || {};
		return {
			icon: iconMap[categoryInfo.icon] || DollarSign,
			color: tx.type === "income" ? "text-green-500" : "text-red-500",
			title: tx.description || tx.category,
			subtitle: tx.category,
		};
	}, [tx, accounts, categories]);

	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center space-x-4 flex-1">
				<div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
					<info.icon className={`h-6 w-6 ${info.color}`} />
				</div>
				<div>
					<p className="font-semibold">{info.title}</p>
					<p className="text-sm text-gray-500">{info.subtitle}</p>
				</div>
			</div>
			<div className="flex items-center space-x-2">
				<div className="text-right">
					<p className={`font-semibold ${info.color}`}>
						{tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
					</p>
					<p className="text-sm text-gray-500">
						{new Date(tx.date).toLocaleDateString()}
					</p>
				</div>
				<div className="relative">
					<button
						type="button"
						onClick={() => setMenuOpen((o) => !o)}
						className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
					>
						<MoreVertical size={20} />
					</button>
					{menuOpen && (
						<div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
							<button
								type="button"
								onClick={() => {
									txModalControls.edit(tx);
									setMenuOpen(false);
								}}
								className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
							>
								<Edit size={16} className="mr-2" /> Edit
							</button>
							<button
								type="button"
								onClick={() => {
									txModalControls.delete(tx.id);
									setMenuOpen(false);
								}}
								className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
							>
								<Trash2 size={16} className="mr-2" /> Delete
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const BudgetsPage = ({ finTrackData, budgetModalControls }) => (
	<div className="p-4 md:p-6 space-y-6">
		{" "}
		<div className="flex justify-between items-center">
			<h1 className="text-2xl font-bold text-gray-800 dark:text-white">
				Your Budgets
			</h1>{" "}
			<button
				type="button"
				onClick={() => budgetModalControls.open()}
				className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
			>
				<Plus size={18} /> Add Budget
			</button>
		</div>{" "}
		{finTrackData.budgets.map((budget) => (
			<BudgetCard
				key={budget.id}
				budget={budget}
				transactions={finTrackData.transactions}
				categories={finTrackData.categories}
				budgetModalControls={budgetModalControls}
			/>
		))}{" "}
	</div>
);
const BudgetCard = ({
	budget,
	transactions,
	categories,
	budgetModalControls,
}) => {
	const budgetData = useMemo(() => {
		const relevantTx = transactions.filter((tx) => {
			const txDate = new Date(tx.date);
			return (
				tx.type === "expense" &&
				txDate >= new Date(budget.startDate) &&
				txDate <= new Date(budget.endDate) &&
				budget.categories[tx.category]
			);
		});
		const spentByCategory = relevantTx.reduce((acc, tx) => {
			acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
			return acc;
		}, {});
		const totalBudget = Object.values(budget.categories).reduce(
			(sum, limit) => sum + limit,
			0,
		);
		const totalSpent = Object.values(spentByCategory).reduce(
			(sum, spent) => sum + spent,
			0,
		);
		return { spentByCategory, totalBudget, totalSpent };
	}, [budget, transactions]);
	const overallPercentage =
		budgetData.totalBudget > 0
			? (budgetData.totalSpent / budgetData.totalBudget) * 100
			: 0;
	return (
		<Card>
			{" "}
			<div className="flex justify-between items-start">
				<div>
					<h3 className="text-lg font-semibold mb-2">{budget.name}</h3>{" "}
					<p className="text-sm text-gray-500 mb-4">
						{new Date(budget.startDate).toLocaleDateString()} -{" "}
						{new Date(budget.endDate).toLocaleDateString()}
					</p>
				</div>{" "}
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => budgetModalControls.edit(budget)}
					>
						<Edit className="w-5 h-5 text-gray-500" />
					</button>
					<button
						type="button"
						onClick={() => budgetModalControls.delete(budget.id)}
					>
						<Trash2 className="w-5 h-5 text-red-500" />
					</button>
				</div>
			</div>{" "}
			<div className="mb-4">
				{" "}
				<div className="flex justify-between mb-1">
					<span className="text-sm font-medium">Overall Progress</span>
					<span className="text-sm font-medium">
						${budgetData.totalSpent.toFixed(2)} / $
						{budgetData.totalBudget.toFixed(2)}
					</span>
				</div>{" "}
				<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
					<div
						className="bg-indigo-600 h-4 rounded-full"
						style={{ width: `${Math.min(overallPercentage, 100)}%` }}
					></div>
				</div>{" "}
			</div>{" "}
			<div className="space-y-3">
				{" "}
				{Object.entries(budget.categories).map(([cat, limit]) => {
					const spent = budgetData.spentByCategory[cat] || 0;
					const percentage = limit > 0 ? (spent / limit) * 100 : 0;
					const categoryInfo = categories[cat] || {};
					return (
						<div key={cat}>
							{" "}
							<div className="flex justify-between items-center mb-1">
								{" "}
								<div className="flex items-center">
									<CategoryIcon
										name={categoryInfo.icon}
										className="w-4 h-4 mr-2"
										style={{ color: categoryInfo.color }}
									/>
									<span className="text-sm font-medium">{cat}</span>
								</div>{" "}
								<span className="text-xs text-gray-500">
									${spent.toFixed(2)} / ${limit.toFixed(2)}
								</span>{" "}
							</div>{" "}
							<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div
									className="h-2 rounded-full"
									style={{
										width: `${Math.min(percentage, 100)}%`,
										backgroundColor: categoryInfo.color || "#8B5CF6",
									}}
								></div>
							</div>{" "}
						</div>
					);
				})}{" "}
			</div>{" "}
		</Card>
	);
};

const AccountItem = ({
	account,
	calculatedBalance,
	transactions,
	accountModalControls,
}) => {
	const { income, expenses } = useMemo(() => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		let income = 0;
		let expenses = 0;

		transactions
			.filter(
				(tx) =>
					(tx.accountId === account.id ||
						tx.to === account.id ||
						tx.from === account.id) &&
					new Date(tx.date) >= startOfMonth &&
					new Date(tx.date) <= endOfMonth,
			)
			.forEach((tx) => {
				if (tx.type === "income" && tx.accountId === account.id) {
					income += tx.amount;
				} else if (tx.type === "expense" && tx.accountId === account.id) {
					expenses += tx.amount;
				} else if (tx.type === "transfer") {
					if (tx.to === account.id) income += tx.amount;
					if (tx.from === account.id) expenses += tx.amount + (tx.fee || 0);
				}
			});

		return { income, expenses };
	}, [account.id, transactions]);

	return (
		<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl">
			<div className="mb-4 sm:mb-0">
				<p className="font-semibold text-lg text-gray-800 dark:text-gray-100">
					{account.name}
				</p>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					{account.type}
				</p>
			</div>
			<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8 w-full sm:w-auto">
				<div className="text-left sm:text-right">
					<p className="text-sm text-green-500">+${income.toFixed(2)}</p>
					<p className="text-sm text-red-500">-${expenses.toFixed(2)}</p>
					<p className="text-xs text-gray-400">This Month</p>
				</div>
				<div className="text-left sm:text-right">
					<p className="text-xl font-bold text-gray-800 dark:text-gray-100">
						${calculatedBalance.toFixed(2)}
					</p>
					<p className="text-xs text-gray-400">Current Balance</p>
				</div>
				<button
					type="button"
					onClick={() => accountModalControls.edit(account)}
					className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full ml-auto sm:ml-0"
				>
					<Edit className="w-5 h-5 text-gray-500" />
				</button>
			</div>
		</div>
	);
};

const AccountsPage = ({ finTrackData, accountModalControls }) => {
	const { accounts, calculatedData, transactions } = finTrackData;
	return (
		<div className="p-4 md:p-6 space-y-6">
			{" "}
			<div className="flex justify-between items-center mb-4">
				{" "}
				<h1 className="text-2xl font-bold text-gray-800 dark:text-white">
					Your Accounts
				</h1>{" "}
				<button
					type="button"
					onClick={() => accountModalControls.open()}
					className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
				>
					{" "}
					<Plus size={18} /> Add Account{" "}
				</button>{" "}
			</div>{" "}
			<div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
				{" "}
				<div className="divide-y divide-gray-200 dark:divide-gray-700">
					{" "}
					{accounts.map((account) => (
						<AccountItem
							key={account.id}
							account={account}
							calculatedBalance={
								calculatedData.accountBalances[account.id] || 0
							}
							transactions={transactions}
							accountModalControls={accountModalControls}
						/>
					))}{" "}
				</div>{" "}
			</div>{" "}
		</div>
	);
};
const SettingsPage = ({
	finTrackData,
	accountModalControls,
	categoryModalControls,
	darkMode,
	setDarkMode,
	autoHideMenu,
	setAutoHideMenu,
}) => {
	const {
		accounts,
		setAccounts,
		categories,
		setCategories,
		setTransactions,
		setBudgets,
		calculatedData,
	} = finTrackData;
	return (
		<div className="p-4 md:p-6 space-y-6">
			{" "}
			<h1 className="text-2xl font-bold text-gray-800 dark:text-white">
				Settings
			</h1>{" "}
			<AppearanceSettings
				darkMode={darkMode}
				setDarkMode={setDarkMode}
				autoHideMenu={autoHideMenu}
				setAutoHideMenu={setAutoHideMenu}
			/>{" "}
			<AccountManagement
				accounts={accounts}
				accountModalControls={accountModalControls}
				calculatedData={calculatedData}
			/>{" "}
			<CategoryManagement
				categories={categories}
				categoryModalControls={categoryModalControls}
			/>{" "}
			<DataManagement
				setTransactions={setTransactions}
				setBudgets={setBudgets}
				setAccounts={setAccounts}
				setCategories={setCategories}
			/>{" "}
		</div>
	);
};
const AccountManagement = ({
	accounts,
	accountModalControls,
	calculatedData,
}) => (
	<Card>
		{" "}
		<div className="flex justify-between items-center mb-4">
			{" "}
			<h3 className="text-lg font-semibold">Manage Accounts</h3>{" "}
			<button
				type="button"
				onClick={() => accountModalControls.open()}
				className="p-2 bg-indigo-600 text-white rounded-md"
			>
				<Plus className="h-5 w-5" />
			</button>{" "}
		</div>{" "}
		<div className="space-y-2">
			{" "}
			{accounts.map((acc) => (
				<div
					key={acc.id}
					className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-md"
				>
					{" "}
					<div>
						{" "}
						<p className="font-semibold">{acc.name}</p>{" "}
						<p className="text-sm text-gray-500">{acc.type}</p>{" "}
					</div>{" "}
					<div className="flex items-center gap-4">
						{" "}
						<p className="font-mono text-sm">
							${(calculatedData.accountBalances[acc.id] || 0).toFixed(2)}
						</p>{" "}
						<button
							type="button"
							onClick={() => accountModalControls.edit(acc)}
							className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
						>
							<Edit className="w-5 h-5 text-gray-500" />
						</button>{" "}
					</div>{" "}
				</div>
			))}{" "}
		</div>{" "}
	</Card>
);
const CategoryManagement = ({ categories, categoryModalControls }) => (
	<Card>
		{" "}
		<div className="flex justify-between items-center mb-4">
			{" "}
			<h3 className="text-lg font-semibold">Manage Categories</h3>{" "}
			<button
				type="button"
				onClick={() => categoryModalControls.open()}
				className="p-2 bg-indigo-600 text-white rounded-md"
			>
				<Plus className="h-5 w-5" />
			</button>{" "}
		</div>{" "}
		<div className="space-y-2">
			{" "}
			{Object.entries(categories).map(
				([catName, { icon: catIcon, color: catColor, isProtected }]) => (
					<div
						key={catName}
						className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-md"
					>
						{" "}
						<CategoryIcon
							name={catIcon}
							style={{ color: catColor }}
							className="w-5 h-5 mr-3"
						/>{" "}
						<span className="flex-grow">{catName}</span>{" "}
						{isProtected ? (
							<Lock
								className="w-5 h-5 text-gray-400"
								title="This category cannot be edited or deleted"
							/>
						) : (
							<button
								type="button"
								onClick={() =>
									categoryModalControls.edit({
										id: catName,
										...categories[catName],
									})
								}
								className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
							>
								<Edit className="w-5 h-5 text-gray-500" />
							</button>
						)}{" "}
					</div>
				),
			)}{" "}
		</div>{" "}
	</Card>
);
const DataManagement = ({
	setTransactions,
	setBudgets,
	setAccounts,
	setCategories,
}) => {
	const [showReset, setShowReset] = useState(false);
	const resetData = () => {
		setTransactions(initialTransactions);
		setBudgets(initialBudgets);
		setAccounts(initialAccounts);
		setCategories(defaultCategories);
		setShowReset(false);
	};
	return (
		<Card>
			{" "}
			<h3 className="text-lg font-semibold mb-4">Data Management</h3>{" "}
			<button
				type="button"
				onClick={() => setShowReset(true)}
				className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
			>
				<RefreshCw className="h-5 w-5 mr-2" /> Reset All Data
			</button>{" "}
			<ConfirmationModal
				isOpen={showReset}
				onClose={() => setShowReset(false)}
				onConfirm={resetData}
				title="Reset All Data"
				message="Are you sure? This will restore the app to its initial state."
			/>{" "}
		</Card>
	);
};
const AppearanceSettings = ({
	darkMode,
	setDarkMode,
	autoHideMenu,
	setAutoHideMenu,
}) => (
	<Card>
		{" "}
		<h3 className="text-lg font-semibold mb-4">Appearance</h3>{" "}
		<div className="flex items-center justify-between">
			{" "}
			<label
				htmlFor="dark-mode-toggle"
				className="text-gray-700 dark:text-gray-300"
			>
				Dark Mode
			</label>{" "}
			<button
				type="button"
				id="dark-mode-toggle"
				onClick={() => setDarkMode(!darkMode)}
				className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${darkMode ? "bg-indigo-600" : "bg-gray-200"}`}
			>
				{" "}
				<span
					className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${darkMode ? "translate-x-6" : "translate-x-1"}`}
				/>{" "}
			</button>{" "}
		</div>{" "}
		<div className="flex items-center justify-between mt-4">
			{" "}
			<label
				htmlFor="auto-hide-toggle"
				className="text-gray-700 dark:text-gray-300"
			>
				Auto-hide menu on click
			</label>{" "}
			<button
				type="button"
				id="auto-hide-toggle"
				onClick={() => setAutoHideMenu(!autoHideMenu)}
				className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${autoHideMenu ? "bg-indigo-600" : "bg-gray-200"}`}
			>
				{" "}
				<span
					className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${autoHideMenu ? "translate-x-6" : "translate-x-1"}`}
				/>{" "}
			</button>{" "}
		</div>{" "}
	</Card>
);

// --- MAIN APP COMPONENT ---
export default function App() {
	const [activeView, setActiveView] = useState("dashboard");
	const finTrackData = useFinTrack();
	const [txModalState, setTxModalState] = useState({
		open: false,
		edit: null,
		delete: null,
	});
	const [budgetModalState, setBudgetModalState] = useState({
		open: false,
		edit: null,
		delete: null,
	});
	const [accountModalState, setAccountModalState] = useState({
		open: false,
		edit: null,
	});
	const [categoryModalState, setCategoryModalState] = useState({
		open: false,
		edit: null,
	});
	const [darkMode, setDarkMode] = useStickyState(false, "fintrack-dark-mode");
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [autoHideMenu, setAutoHideMenu] = useStickyState(
		true,
		"fintrack-autohide-menu",
	);

	useEffect(() => {
		if (darkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [darkMode]);

	const handleSaveTx = (tx) => {
		finTrackData.handleSaveTransaction(tx);
	};
	const handleDeleteTx = () => {
		if (txModalState.delete) {
			finTrackData.handleDeleteTransaction(txModalState.delete);
			closeTxModal();
		}
	};
	const openTxModal = (editTx = null) =>
		setTxModalState({ open: true, edit: editTx, delete: null });
	const openDeleteTxModal = (txId) =>
		setTxModalState({ ...txModalState, delete: txId });
	const closeTxModal = () =>
		setTxModalState({ open: false, edit: null, delete: null });
	const txModalControls = {
		open: openTxModal,
		close: closeTxModal,
		delete: openDeleteTxModal,
		edit: (tx) => openTxModal(tx),
	};

	const handleSaveBudget = (budget) => {
		finTrackData.handleSaveBudget(budget);
	};
	const handleDeleteBudget = () => {
		if (budgetModalState.delete) {
			finTrackData.handleDeleteBudget(budgetModalState.delete);
			closeBudgetModal();
		}
	};
	const openBudgetModal = (editBudget = null) =>
		setBudgetModalState({ open: true, edit: editBudget, delete: null });
	const openDeleteBudgetModal = (budgetId) =>
		setBudgetModalState({ ...budgetModalState, delete: budgetId });
	const closeBudgetModal = () =>
		setBudgetModalState({ open: false, edit: null, delete: null });
	const budgetModalControls = {
		open: openBudgetModal,
		close: closeBudgetModal,
		edit: openBudgetModal,
		delete: openDeleteBudgetModal,
	};

	const openAccountModal = (editAccount = null) =>
		setAccountModalState({ open: true, edit: editAccount });
	const closeAccountModal = () =>
		setAccountModalState({ open: false, edit: null });
	const accountModalControls = {
		open: openAccountModal,
		close: closeAccountModal,
		edit: openAccountModal,
	};

	const handleSaveCategory = (category) => {
		finTrackData.setCategories((prev) => {
			const newCats = { ...prev };
			if (category.originalId && category.originalId !== category.id) {
				delete newCats[category.originalId];
			}
			newCats[category.id] = { icon: category.icon, color: category.color };
			return newCats;
		});
	};
	const handleDeleteCategory = (categoryId) => {
		finTrackData.setCategories((prev) => {
			const newCats = { ...prev };
			delete newCats[categoryId];
			return newCats;
		});
	};
	const openCategoryModal = (editCategory = null) =>
		setCategoryModalState({ open: true, edit: editCategory });
	const closeCategoryModal = () =>
		setCategoryModalState({ open: false, edit: null });
	const categoryModalControls = {
		open: openCategoryModal,
		close: closeCategoryModal,
		edit: openCategoryModal,
	};

	const renderActiveView = () => {
		const props = {
			finTrackData,
			txModalControls,
			budgetModalControls,
			accountModalControls,
			categoryModalControls,
			darkMode,
			setDarkMode,
			autoHideMenu,
			setAutoHideMenu,
		};
		switch (activeView) {
			case "dashboard":
				return <DashboardPage {...props} />;
			case "budgets":
				return <BudgetsPage {...props} />;
			case "accounts":
				return <AccountsPage {...props} />;
			case "settings":
				return <SettingsPage {...props} />;
			default:
				return <DashboardPage {...props} />;
		}
	};

	return (
		<div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
			<div className="relative flex">
				<Sidebar
					activeView={activeView}
					setActiveView={setActiveView}
					isDrawerOpen={isDrawerOpen}
					setIsDrawerOpen={setIsDrawerOpen}
					autoHideMenu={autoHideMenu}
				/>
				<div className="flex-1 flex flex-col w-full">
					<Header
						onSettingsClick={() => setActiveView("settings")}
						notifications={finTrackData.notifications}
						onClearNotifications={() => finTrackData.setNotifications([])}
						pageTitle={activeView.charAt(0).toUpperCase() + activeView.slice(1)}
						onMenuClick={() => setIsDrawerOpen(!isDrawerOpen)}
					/>
					<main className="pb-20 md:pb-6">{renderActiveView()}</main>
				</div>
			</div>
			<BottomNav activeView={activeView} setActiveView={setActiveView} />

			<button
				type="button"
				onClick={() => openTxModal()}
				className="md:hidden fixed bottom-24 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 z-10"
			>
				<Plus size={24} />
			</button>

			<TransactionModal
				isOpen={txModalState.open}
				onClose={closeTxModal}
				onSave={handleSaveTx}
				transactionToEdit={txModalState.edit}
				accounts={finTrackData.accounts}
				categories={finTrackData.categories}
			/>
			<ConfirmationModal
				isOpen={!!txModalState.delete}
				onClose={closeTxModal}
				onConfirm={handleDeleteTx}
				title="Delete Transaction"
				message="Are you sure you want to delete this transaction?"
			/>
			<BudgetModal
				isOpen={budgetModalState.open}
				onClose={closeBudgetModal}
				onSave={handleSaveBudget}
				budgetToEdit={budgetModalState.edit}
				masterCategories={finTrackData.categories}
			/>
			<ConfirmationModal
				isOpen={!!budgetModalState.delete}
				onClose={closeBudgetModal}
				onConfirm={handleDeleteBudget}
				title="Delete Budget"
				message="Are you sure you want to delete this budget?"
			/>
			<AccountModal
				isOpen={accountModalState.open}
				onClose={closeAccountModal}
				onSave={finTrackData.handleSaveAccount}
				onDelete={finTrackData.handleDeleteAccount}
				accountToEdit={accountModalState.edit}
				calculatedBalance={
					accountModalState.edit
						? finTrackData.calculatedData.accountBalances[
								accountModalState.edit.id
							]
						: 0
				}
				onSaveTransaction={finTrackData.handleSaveTransaction}
			/>
			<CategoryModal
				isOpen={categoryModalState.open}
				onClose={closeCategoryModal}
				onSave={handleSaveCategory}
				onDelete={handleDeleteCategory}
				categoryToEdit={categoryModalState.edit}
			/>
		</div>
	);
}
