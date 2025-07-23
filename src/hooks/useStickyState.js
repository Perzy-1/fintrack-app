import { useState, useEffect } from 'react';

export const useStickyState = (defaultValue, key) => {
	const [value, setValue] = useState(() => {
		try {
			const stickyValue = localStorage.getItem(key);
			if (stickyValue && typeof defaultValue === "object" && defaultValue instanceof Date) {
				return new Date(JSON.parse(stickyValue));
			}
			return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
		} catch {
			return defaultValue;
		}
	});
	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);
	return [value, setValue];
};
