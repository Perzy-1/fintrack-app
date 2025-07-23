import React from 'react';
import { DollarSign } from 'lucide-react';
import { iconMap } from '../../lib/constants';

const CategoryIcon = ({ name, className, type = "icon", ...props }) => {
	if (type === "emoji") {
		return <span className={`text-2xl inline-block ${className}`} {...props}>{name}</span>;
	}
	const IconComponent = iconMap[name] || DollarSign;
	return <IconComponent className={className} {...props} />;
};

export default CategoryIcon;
