import React, { useState } from 'react';
import { Bell, Settings, ChevronLeft, AlertTriangle, CheckCircle } from 'lucide-react';

const Header = ({ onSettingsClick, notifications, onClearNotifications, pageTitle, onBack }) => {
	const [panelOpen, setPanelOpen] = useState(false);
	const unreadCount = notifications.filter((n) => !n.read).length;
	return (
		<header className="flex justify-between items-center px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-30">
			<div className="flex items-center">
				{onBack && (
					<button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2">
						<ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
					</button>
				)}
				<h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{pageTitle}</h1>
			</div>
			<div className="flex items-center space-x-2 md:space-x-4">
				<div className="relative">
					<button type="button" onClick={() => setPanelOpen(!panelOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative">
						<Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
						{unreadCount > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>}
					</button>
					{panelOpen && (
						<div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-30">
							<div className="p-3 flex justify-between items-center border-b dark:border-gray-600">
								<h4 className="font-semibold text-gray-800 dark:text-white">Notifications</h4>
								{notifications.length > 0 && (
									<button type="button" onClick={() => { onClearNotifications(); setPanelOpen(false); }} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Clear all</button>
								)}
							</div>
							<div className="max-h-80 overflow-y-auto">
								{notifications.length > 0 ? (
									notifications.map((n) => (
										<div key={n.id} className="p-3 flex items-start space-x-3 border-b dark:border-gray-600 last:border-b-0">
											{n.type === "warning" ? <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" /> : <CheckCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />}
											<div>
												<p className="text-sm text-gray-700 dark:text-gray-200">{n.message}</p>
												<p className="text-xs text-gray-400 dark:text-gray-500">{new Date(n.date).toLocaleString()}</p>
											</div>
										</div>
									))
								) : (
									<p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No new notifications.</p>
								)}
							</div>
						</div>
					)}
				</div>
				<button type="button" onClick={onSettingsClick} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
					<Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
				</button>
			</div>
		</header>
	);
};

export default Header;
