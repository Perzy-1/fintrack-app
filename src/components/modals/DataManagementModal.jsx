import React, { useState, useRef } from 'react';
import { X, Download, Upload, RefreshCw } from 'lucide-react';
import Card from '../common/Card';
import ConfirmationModal from '../common/ConfirmationModal';
import { initDB, validateAndCleanData } from '../../lib/db';
import { STORES, initialData } from '../../lib/constants';
import { formatDateForInput } from '../../lib/utils';

const DataManagementModal = ({ isOpen, onClose, finTrackData, onError }) => {
        const { accounts = [] } = finTrackData;
	const [showReset, setShowReset] = useState(false);
	const [showImportConfirm, setShowImportConfirm] = useState(false);
	const [showCsvConfirm, setShowCsvConfirm] = useState(false);
	const [dataToImport, setDataToImport] = useState(null);
	const [csvData, setCsvData] = useState(null);
	const jsonInputRef = useRef(null);
	const csvInputRef = useRef(null);

	const handleExport = async () => {
		try {
			const db = await initDB();
			const allData = { version: 2 };
			for (const storeName of STORES) {
				if (storeName === "categories") {
					const catData = await db.get("categories", "main");
					allData[storeName] = { expense: catData.expense, income: catData.income, special: catData.special };
				} else {
					allData[storeName] = await db.getAll(storeName);
				}
			}
			const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(allData, null, 2))}`;
			const link = document.createElement("a");
			link.href = jsonString;
			link.download = `fintrack_backup_${new Date().toISOString().split("T")[0]}.json`;
			link.click();
		} catch (error) {
			onError("Failed to export data.");
			console.error("Export error:", error);
		}
	};

	const handleJsonFileChange = (event) => {
		const file = event.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const importedData = JSON.parse(e.target.result);
				if (importedData.accounts && importedData.budgets && importedData.transactions && importedData.categories) {
					setDataToImport(importedData);
					setShowImportConfirm(true);
				} else {
					onError("Invalid backup file format.");
				}
			} catch (err) {
				onError("Failed to parse backup file.");
				console.error("File parse error:", err);
			}
		};
		reader.readAsText(file);
		event.target.value = null;
	};

        const confirmJsonImport = async () => {
                if (!dataToImport) return;
                try {
                        const balances = {};
                        dataToImport.accounts.forEach((acc) => { balances[acc.id] = 0; });
                        const sortedTransactions = [...dataToImport.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
                        sortedTransactions.forEach((tx) => {
                                if (tx.type === "income") { if (balances[tx.accountId] !== undefined) balances[tx.accountId] += tx.amount; }
                                else if (tx.type === "expense") { if (balances[tx.accountId] !== undefined) balances[tx.accountId] -= tx.amount; }
                                else if (tx.type === "transfer") {
                                        if (balances[tx.from] !== undefined) balances[tx.from] -= tx.amount + (tx.fee || 0);
                                        if (balances[tx.to] !== undefined) balances[tx.to] += tx.amount;
                                }
                        });
                        const recalculatedAccounts = dataToImport.accounts.map((acc) => ({ ...acc, balance: balances[acc.id] || 0 }));
                        const cleanedData = validateAndCleanData({ ...dataToImport, accounts: recalculatedAccounts });
                        const db = await initDB();
                        await db.transaction('rw', STORES, async () => {
                                await Promise.all(STORES.map((name) => db.table(name).clear()));
                                await Promise.all([
                                        ...cleanedData.accounts.map((item) => db.table('accounts').put(item)),
                                        ...cleanedData.transactions.map((item) => db.table('transactions').put(item)),
                                        ...cleanedData.budgets.map((item) => db.table('budgets').put(item)),
                                        db.table('categories').put({ id: 'main', ...cleanedData.categories }),
                                        ...(cleanedData.recurringTransactions || []).map((item) => db.table('recurringTransactions').put(item)),
                                        ...(cleanedData.paymentScheduleOverrides || []).map((item) => db.table('paymentScheduleOverrides').put(item)),
                                ]);
                        });
                } catch (error) {
                        onError("Failed to import data.");
                        console.error("Import error:", error);
                } finally {
                        setShowImportConfirm(false);
                        setDataToImport(null);
                        onClose();
                }
        };

	const handleCsvFileChange = (event) => {
		const file = event.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target.result;
				const { data, errors } = parseCsv(text);
				if (errors.length > 0) { onError(`CSV parsing errors: ${errors.join(", ")}`); return; }
				setCsvData(data);
				setShowCsvConfirm(true);
                        } catch {
                                onError("Failed to parse CSV file.");
                        }
                };
		reader.readAsText(file);
		event.target.value = null;
	};

	const parseCsv = (csvText) => {
		const lines = csvText.trim().split(/\r?\n/);
		if (lines.length < 2) return { data: [], errors: ["CSV must have a header and at least one data row."] };
		const headers = lines[0].split(",").map((h) => h.trim());
		const data = [];
		const errors = [];
		const requiredHeaders = ["date", "amount", "description", "type", "category"];
		for (const required of requiredHeaders) {
			if (!headers.includes(required)) errors.push(`Missing required header: ${required}`);
		}
		if (errors.length > 0) return { data: [], errors };
		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(",");
			const row = headers.reduce((obj, header, index) => {
				obj[header] = values[index]?.trim();
				return obj;
			}, {});
			data.push(row);
		}
		return { data, errors };
	};

        const confirmCsvImport = async () => {
                if (!csvData) return;
                try {
                        const defaultAccountId = accounts[0]?.id;
                        if (!defaultAccountId) { onError("No default account available to import transactions."); return; }
                        const db = await initDB();
                        await db.transaction('rw', ['transactions', 'accounts'], async () => {
                                const accountsTable = db.table('accounts');
                                const transactionsTable = db.table('transactions');
                                let balance = (await accountsTable.get(defaultAccountId))?.balance || 0;
                                for (const row of csvData) {
                                        let finalCategory = row.category;
                                        if (row.description.trim().toLowerCase() === 'difference') finalCategory = 'Balance Adjustment';
                                        const amount = parseFloat(row.amount);
                                        const newTx = {
                                                id: `tx-${Date.now()}-${Math.random()}`,
                                                accountId: defaultAccountId,
                                                amount,
                                                date: formatDateForInput(new Date(row.date)),
                                                description: row.description,
                                                type: row.type,
                                                category: finalCategory,
                                        };
                                        await transactionsTable.put(newTx);
                                        if (row.type === 'income') balance += amount;
                                        else if (row.type === 'expense') balance -= amount;
                                }
                                await accountsTable.update(defaultAccountId, { balance });
                        });
                } catch (error) {
                        onError("Failed to import CSV data.");
                        console.error("CSV Import error:", error);
                } finally {
                        setShowCsvConfirm(false);
                        setCsvData(null);
                        onClose();
                }
        };

        const resetData = async () => {
                try {
                        const db = await initDB();
                        await db.transaction('rw', STORES, async () => {
                                await Promise.all(STORES.map((name) => db.table(name).clear()));
                                await Promise.all([
                                        ...initialData.accounts.map((item) => db.table('accounts').put(item)),
                                        ...initialData.transactions.map((item) => db.table('transactions').put(item)),
                                        ...initialData.budgets.map((item) => db.table('budgets').put(item)),
                                        db.table('categories').put({ id: 'main', ...initialData.categories }),
                                        ...(initialData.recurringTransactions || []).map((item) => db.table('recurringTransactions').put(item)),
                                        ...(initialData.paymentScheduleOverrides || []).map((item) => db.table('paymentScheduleOverrides').put(item)),
                                ]);
                        });
                } catch (error) {
                        onError("Failed to reset data.");
                        console.error("Reset error:", error);
                } finally {
                        setShowReset(false);
                        onClose();
                }
        };

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<Card className="w-full max-w-md">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold">Data Management</h3>
					<button type="button" onClick={onClose}><X /></button>
				</div>
				<div className="space-y-3">
					<input type="file" ref={jsonInputRef} onChange={handleJsonFileChange} className="hidden" accept=".json" />
					<input type="file" ref={csvInputRef} onChange={handleCsvFileChange} className="hidden" accept=".csv" />
					<button type="button" onClick={handleExport} className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"><Download className="h-5 w-5" /> Export Data</button>
					<button type="button" onClick={() => jsonInputRef.current.click()} className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"><Upload className="h-5 w-5" /> Import from Backup (.json)</button>
					<button type="button" onClick={() => csvInputRef.current.click()} className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"><Upload className="h-5 w-5" /> Import Transactions (.csv)</button>
					<button type="button" onClick={() => setShowReset(true)} className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"><RefreshCw className="h-5 w-5" /> Reset All Data</button>
				</div>
				<ConfirmationModal isOpen={showReset} onClose={() => setShowReset(false)} onConfirm={resetData} title="Reset All Data" message="Are you sure? This will delete all data and restore it to the initial state." />
				<ConfirmationModal isOpen={showImportConfirm} onClose={() => setShowImportConfirm(false)} onConfirm={confirmJsonImport} title="Import Data" message="This will overwrite all current data. Are you sure?" />
				<ConfirmationModal isOpen={showCsvConfirm} onClose={() => setShowCsvConfirm(false)} onConfirm={confirmCsvImport} title="Import CSV Transactions" message={`Are you sure you want to import ${csvData?.length} transactions? They will be added to your current data.`} />
			</Card>
		</div>
	);
};

export default DataManagementModal;
