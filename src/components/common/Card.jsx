import React from 'react';

const Card = ({ children, className = "" }) => (
	<div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 md:p-6 ${className}`}>
		{children}
	</div>
);

export default Card;
