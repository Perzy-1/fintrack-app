import React from 'react';
import { X } from 'lucide-react';

const ErrorBannerSystem = ({ errors, onClose }) => (
	<div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 space-y-2 z-50">
		{errors.map((error) => (
			<div key={error.id} className="bg-red-500 text-white p-3 rounded-lg shadow-lg flex justify-between items-center animate-slide-in-fade-out">
				<span>{error.message} {error.count > 1 && `(${error.count})`}</span>
				<button onClick={() => onClose(error.id)}><X size={20} /></button>
			</div>
		))}
	</div>
);

export default ErrorBannerSystem;
