import React from 'react';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import Card from '../common/Card';
import { formatCurrency } from '../../lib/utils';

const NetWorthCard = ({ calculatedData, currency }) => (
	<Card>
		<h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Net Worth</h2>
		<div className="text-center mb-4">
			<p className="text-3xl md:text-4xl font-bold">{formatCurrency(calculatedData.netWorth, currency)}</p>
		</div>
		<div className="grid grid-cols-3 gap-4 text-center text-sm">
			<div>
				<div className="flex items-center justify-center gap-2 text-green-500"><TrendingUp size={16} /><span className="font-medium">Assets</span></div>
				<p>{formatCurrency(calculatedData.totalAssets, currency)}</p>
			</div>
			<div>
				<div className="flex items-center justify-center gap-2 text-blue-500"><Users size={16} /><span className="font-medium">Loans</span></div>
				<p>{formatCurrency(calculatedData.totalLoans, currency)}</p>
			</div>
			<div>
				<div className="flex items-center justify-center gap-2 text-red-500"><TrendingDown size={16} /><span className="font-medium">Liabilities</span></div>
				<p>{formatCurrency(calculatedData.totalLiabilities, currency)}</p>
			</div>
		</div>
	</Card>
);

export default NetWorthCard;
