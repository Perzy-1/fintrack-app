import {
	Car, ShoppingCart, Clapperboard, Wifi, Home as HomeIcon, Briefcase, Gift, Plane, Users, DollarSign, PiggyBank, Smile, Star, Heart, ThumbsUp, Pizza, Coffee, Book, Film, Music, Gamepad2, Bus, Train, Bike, Building, Utensils, Shirt, Tv, Phone, CreditCard, Droplet, Sprout, Cat, Dog, PawPrint, GraduationCap, School, Landmark, Palette, Pencil, Popcorn, Banknote, Coins, Receipt, Repeat, Database, Copy, TrendingUp
} from "lucide-react";

// Added 'paymentScheduleOverrides' to the list of stores
export const STORES = ["accounts", "transactions", "budgets", "categories", "recurringTransactions", "appSettings", "paymentScheduleOverrides"];

const getStartOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);
const getEndOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const formatDateForInput = (date) => {
	if (!date || isNaN(new Date(date))) return "";
	const d = new Date(date);
	const year = d.getFullYear();
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const day = d.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const initialAccounts = [
	{ id: "acc-1", name: "Main Checking", type: "Debit Card", balance: 4855 },
	{ id: "acc-2", name: "Vacation Fund", type: "Savings", balance: 1200 },
	{ id: "acc-3", name: "Emergency Fund", type: "Savings", balance: 3500 },
	{ id: "acc-4", name: "Cash on Hand", type: "Cash", balance: 150 },
];

export const defaultCategories = {
	expense: {
		Food: { icon: "ShoppingCart", color: "#EF4444", type: "icon" },
		Transport: { icon: "Car", color: "#3B82F6", type: "icon" },
		Entertainment: { icon: "Clapperboard", color: "#8B5CF6", type: "icon" },
		Utilities: { icon: "Wifi", color: "#F97316", type: "icon" },
		Rent: { icon: "HomeIcon", color: "#10B981", type: "icon" },
		Shopping: { icon: "Shirt", color: "#EC4899", type: "icon" },
		"Debt Payment": { icon: "Users", color: "#64748B", type: "icon" },
		"Loan Disbursed": { icon: "TrendingUp", color: "#A855F7", type: "icon" },
	},
	income: {
		Salary: { icon: "Briefcase", color: "#22C55E", type: "icon" },
		Gift: { icon: "Gift", color: "#EC4899", type: "icon" },
		Investment: { icon: "Coins", color: "#14B8A6", type: "icon" },
		"Loan Collection": { icon: "Users", color: "#64748B", type: "icon" },
	},
	special: {
		"Balance Correction": { icon: "PiggyBank", color: "#64748B", isProtected: true, type: "icon" },
		"Balance Adjustment": { icon: "PiggyBank", color: "#64748B", isProtected: true, type: "icon" },
	},
};

export const initialBudgets = [
	{
		id: "bud-1",
		name: "Monthly Expenses",
		period: "Monthly",
		startDate: formatDateForInput(getStartOfMonth()),
		endDate: formatDateForInput(getEndOfMonth()),
		categories: { Food: 400, Transport: 150, Entertainment: 200, Utilities: 150, Rent: 1500 },
		notificationThreshold: 0.8,
	},
];

export const initialTransactions = [
	{ id: "tx-1", accountId: "acc-1", type: "income", amount: 5000, category: "Salary", date: formatDateForInput(getStartOfMonth()), description: "Monthly Salary" },
	{ id: "tx-2", accountId: "acc-1", type: "expense", amount: 85, category: "Food", date: formatDateForInput(new Date()), description: "Groceries" },
	{ id: "tx-3", accountId: "acc-1", type: "expense", amount: 60, category: "Utilities", date: formatDateForInput(new Date()), description: "Internet Bill" },
];

export const initialData = {
	accounts: initialAccounts,
	transactions: initialTransactions,
	budgets: initialBudgets,
	categories: defaultCategories,
	recurringTransactions: [],
    paymentScheduleOverrides: [],
};

export const initialNotifications = [];

export const currencyMap = { USD: "$", EUR: "€", JPY: "¥", GBP: "£", PHP: "₱" };

export const iconMap = {
	Car, ShoppingCart, Clapperboard, Wifi, HomeIcon, Briefcase, Gift, Plane, Users, DollarSign, PiggyBank, Smile, Star, Heart, ThumbsUp, Pizza, Coffee, Book, Film, Music, Gamepad2, Bus, Train, Bike, Building, Utensils, Shirt, Tv, Phone, CreditCard, Droplet, Sprout, Cat, Dog, PawPrint, GraduationCap, School, Landmark, Palette, Pencil, Popcorn, Banknote, Coins, Receipt, Repeat, Database, Copy, TrendingUp
};
