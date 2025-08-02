import Dexie from 'dexie';
import { STORES, defaultCategories } from './constants';

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