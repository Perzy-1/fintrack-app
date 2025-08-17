import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, BarChart2, Wallet, Settings } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: Home, to: '/', end: true },
    { name: 'Transactions', icon: History, to: '/transactions' },
    { name: 'Budgets', icon: BarChart2, to: '/budgets' },
    { name: 'Accounts', icon: Wallet, to: '/accounts' },
    { name: 'Settings', icon: Settings, to: '/settings' }
  ];

  return (
    <div className="hidden md:block fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">FinTrack</h2>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="h-6 w-6" /> <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

