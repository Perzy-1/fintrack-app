import { currencyMap } from './constants';

export const getStartOfDay = (date = new Date()) => {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
};

export const getEndOfDay = (date = new Date()) => {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
};

export const getStartOfWeek = (date = new Date()) => {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	d.setDate(diff);
	return getStartOfDay(d);
};

export const getEndOfWeek = (date = new Date()) => {
	const d = new Date(getStartOfWeek(date));
	d.setDate(d.getDate() + 6);
	return getEndOfDay(d);
};

export const getStartOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

export const getEndOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const getStartOfYear = (date = new Date()) => new Date(date.getFullYear(), 0, 1);

export const getEndOfYear = (date = new Date()) => new Date(date.getFullYear(), 11, 31);

export const formatDateForInput = (date) => {
	if (!date) return "";
	const d = new Date(date);
	const year = d.getFullYear();
	const month = (d.getMonth() + 1).toString().padStart(2, "0");
	const day = d.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const formatRangeLabel = (period, date) => {
	const year = date.getFullYear();
	const monthName = date.toLocaleString("default", { month: "long" });

	switch (period) {
		case "daily":
			return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
		case "weekly": {
			const start = getStartOfWeek(date);
			const end = getEndOfWeek(date);
			const startMonth = start.toLocaleString("default", { month: "short" });
			const endMonth = end.toLocaleString("default", { month: "short" });
			if (start.getMonth() === end.getMonth()) {
				return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
			}
			return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
		}
		case "monthly":
			return `${monthName} ${year}`;
		case "annually":
			return `${year}`;
		default:
			return "Custom Range";
	}
};

export const formatCurrency = (amount, currencyKey = "USD") => {
	const symbol = currencyMap[currencyKey] || "$";
	return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDateHeader = (dateString) => {
	const date = new Date(dateString + "T00:00:00");
	return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};
