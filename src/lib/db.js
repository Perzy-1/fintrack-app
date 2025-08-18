import Dexie from 'dexie';
import { STORES, defaultCategories, initialData } from './constants';

const DB_NAME = "fintrack-db-2";
const DB_VERSION = 3;

export const db = new Dexie(DB_NAME);

// Define the database schema based on the stores from constants.js
const schema = STORES.reduce((acc, storeName) => {
    acc[storeName] = 'id'; // Assuming 'id' is the primary key for all stores
    return acc;
}, {});

db.version(DB_VERSION).stores(schema);

export const validateAndCleanData = (loadedData) => {
	const categories = {
		...defaultCategories,
		...loadedData.categories,
		expense: { ...defaultCategories.expense, ...(loadedData.categories?.expense || {}) },
		income: { ...defaultCategories.income, ...(loadedData.categories?.income || {}) },
		special: { ...defaultCategories.special, ...(loadedData.categories?.special || {}) },
	};
        return { ...loadedData, categories };
};


export const initDB = async () => {
        if (!db.isOpen()) {
                await db.open();
        }
        const hasData = await db.accounts.count();
        if (hasData === 0) {
                // Dexie expects the transaction mode as the first argument and the
                // list of stores as the second. The previous implementation passed
                // the arguments in the wrong order which resulted in Dexie trying
                // to call string methods on the stores array ("mode.replace is not a
                // function"). Swapping the order correctly opens a readwrite
                // transaction across all defined stores.
                const tx = db.transaction('readwrite', STORES);
                await Promise.all([
                        ...initialData.accounts.map((item) => tx.objectStore('accounts').put(item)),
                        ...initialData.transactions.map((item) => tx.objectStore('transactions').put(item)),
                        ...initialData.budgets.map((item) => tx.objectStore('budgets').put(item)),
                        tx.objectStore('categories').put({ id: 'main', ...initialData.categories }),
                        ...(initialData.recurringTransactions || []).map((item) => tx.objectStore('recurringTransactions').put(item)),
                        ...(initialData.paymentScheduleOverrides || []).map((item) => tx.objectStore('paymentScheduleOverrides').put(item)),
                ]);
                await tx.done;
        }
        return db;
};
