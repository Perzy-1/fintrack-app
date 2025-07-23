import React from 'react';
import { Home, History, BarChart2, Wallet } from 'lucide-react';

const BottomNav = ({ activeView, onTabClick }) => {
	const navItems = [
		{ name: "Dashboard", icon: Home, view: "dashboard" },
		{ name: "Transactions", icon: History, view: "transactions" },
		{ name: "Budgets", icon: BarChart2, view: "budgets" },
		{ name: "Accounts", icon: Wallet, view: "accounts" },
	];
	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-20 md:hidden">
			{navItems.map((item) => (
				<button
					type="button"
					key={item.name}
					onClick={() => onTabClick(item.view)}
					className={`flex flex-col items-center space-y-1 w-20 ${activeView === item.view ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}
				>
					<item.icon className="h-6 w-6" />
					<span className="text-xs">{item.name}</span>
				</button>
			))}
		</div>
	);
};

export default BottomNav;
