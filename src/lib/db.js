import { STORES, defaultCategories } from './constants';

const DB_NAME = "fintrack-db";
// --- FIX ---
// Incremented DB_VERSION from 2 to 3.
// This is critical to trigger the 'upgrade' function for users who have an older
// database schema. The upgrade will create any missing object stores (like 'appSettings')
// and resolve the "NotFoundError".
const DB_VERSION = 3;

export const initDB = async () => {
	const { openDB } = await import("https://cdn.jsdelivr.net/npm/idb@7/build/index.js");
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// This function runs only when DB_VERSION is increased.
			// It safely creates object stores if they don't already exist.
			STORES.forEach((storeName) => {
				if (!db.objectStoreNames.contains(storeName)) {
					db.createObjectStore(storeName, { keyPath: "id" });
				}
			});
		},
	});
};

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
