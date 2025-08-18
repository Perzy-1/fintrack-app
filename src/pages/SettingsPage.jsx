import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import ManagementButton from '../components/common/ManagementButton';
import { currencyMap } from '../lib/constants';
import { Wallet, BarChart2, Repeat, Database } from 'lucide-react';

const AppearanceSettings = ({ theme, setTheme, currency, setCurrency, budgetDisplay, setBudgetDisplay }) => (
	<Card>
		<h3 className="text-lg font-semibold mb-4">Appearance</h3>
		<div className="space-y-4">
			<div>
				<label className="text-gray-700 dark:text-gray-300">Theme</label>
				<div className="flex justify-between items-center mt-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
					{["light", "dark", "system"].map((opt) => (<button key={opt} onClick={() => setTheme(opt)} className={`w-full text-center text-sm capitalize px-3 py-1 rounded-md transition-colors ${theme === opt ? "bg-white dark:bg-gray-600 shadow" : "text-gray-500 dark:text-gray-300"}`}>{opt}</button>))}
				</div>
			</div>
			<div className="flex items-center justify-between">
				<label htmlFor="currency-select" className="text-gray-700 dark:text-gray-300">Currency</label>
				<select id="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
					{Object.keys(currencyMap).map((key) => (<option key={key} value={key}>{key} ({currencyMap[key]})</option>))}
				</select>
			</div>
			<div>
				<label className="text-gray-700 dark:text-gray-300">Budget Display</label>
				<div className="flex justify-between items-center mt-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
					{["ratio", "remaining", "both"].map((opt) => (<button key={opt} onClick={() => setBudgetDisplay(opt)} className={`w-full text-center text-sm capitalize px-3 py-1 rounded-md transition-colors ${budgetDisplay === opt ? "bg-white dark:bg-gray-600 shadow" : "text-gray-500 dark:text-gray-300"}`}>{opt}</button>))}
				</div>
			</div>
		</div>
	</Card>
);

const GeneralSettings = ({ weekStartsOn, setWeekStartsOn, monthStartsOn, setMonthStartsOn }) => (
	<Card>
		<h3 className="text-lg font-semibold mb-4">General</h3>
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<label htmlFor="week-start-select" className="text-gray-700 dark:text-gray-300">Week Starts On</label>
				<select id="week-start-select" value={weekStartsOn} onChange={(e) => setWeekStartsOn(e.target.value)} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
					<option value="Sunday">Sunday</option><option value="Monday">Monday</option><option value="Saturday">Saturday</option>
				</select>
			</div>
			<div className="flex items-center justify-between">
				<label htmlFor="month-start-input" className="text-gray-700 dark:text-gray-300">Month Start Day</label>
				<input id="month-start-input" type="number" value={monthStartsOn} onChange={(e) => setMonthStartsOn(parseInt(e.target.value, 10))} min="1" max="28" className="w-20 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
			</div>
		</div>
	</Card>
);

const SettingsPage = ({ theme, setTheme, currency, setCurrency, budgetDisplay, setBudgetDisplay, weekStartsOn, setWeekStartsOn, monthStartsOn, setMonthStartsOn, onDataManagementClick }) => {
        const navigate = useNavigate();
        return (
                <div className="p-4 md:p-6 space-y-6">
                        <AppearanceSettings theme={theme} setTheme={setTheme} currency={currency} setCurrency={setCurrency} budgetDisplay={budgetDisplay} setBudgetDisplay={setBudgetDisplay} />
                        <GeneralSettings weekStartsOn={weekStartsOn} setWeekStartsOn={setWeekStartsOn} monthStartsOn={monthStartsOn} setMonthStartsOn={setMonthStartsOn} />
                        <Card>
                                <h3 className="text-lg font-semibold mb-4">Management</h3>
                                <div className="space-y-3">
                                        <ManagementButton onClick={() => navigate("/manage/accounts")} icon={Wallet} label="Manage Accounts" />
                                        <ManagementButton onClick={() => navigate("/manage/categories")} icon={BarChart2} label="Manage Categories" />
                                        <ManagementButton onClick={() => navigate("/manage/recurring")} icon={Repeat} label="Recurring Transactions" />
                                        <ManagementButton onClick={onDataManagementClick} icon={Database} label="Data Management" />
                                </div>
                        </Card>
                        <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">Version: 1.0.3</div>
                </div>
        );
};

export default SettingsPage;
