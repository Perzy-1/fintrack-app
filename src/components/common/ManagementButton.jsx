import React from 'react';
import { ChevronRight } from 'lucide-react';

const ManagementButton = ({ onClick, icon, label }) => {
        const IconComponent = icon;
        return (
                <button onClick={onClick} className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center gap-3">
                                {IconComponent && <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                                <span className="font-semibold">{label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
        );
};

export default ManagementButton;
