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
                await db.transaction('rw', STORES, async () => {
                        await Promise.all([
                                ...initialData.accounts.map((item) => db.table('accounts').put(item)),
                                ...initialData.transactions.map((item) => db.table('transactions').put(item)),
                                ...initialData.budgets.map((item) => db.table('budgets').put(item)),
                                db.table('categories').put({ id: 'main', ...initialData.categories }),
                                ...(initialData.recurringTransactions || []).map((item) => db.table('recurringTransactions').put(item)),
                                ...(initialData.paymentScheduleOverrides || []).map((item) => db.table('paymentScheduleOverrides').put(item)),
                        ]);
                });
        }
        return db;
};
