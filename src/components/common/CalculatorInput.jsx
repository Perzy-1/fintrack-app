import React, { useState, useEffect, useRef } from 'react';
import { Delete } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

const CalculatorKeypad = ({ onKeyPress, onDone, displayValue }) => {
	const keys = [
		"7", "8", "9", { label: "÷", value: "/", type: "operator" },
		"4", "5", "6", { label: "×", value: "*", type: "operator" },
		"1", "2", "3", { label: "-", value: "-", type: "operator" },
		".", "0", { icon: Delete, value: "backspace", type: "action" },
		{ label: "+", value: "+", type: "operator" },
	];

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm p-4 z-50 rounded-t-2xl">
			<div className="bg-slate-900 text-right p-4 rounded-lg mb-4 text-4xl font-light text-white h-20 flex items-center justify-end">
				{displayValue || "0"}
			</div>
			<div className="grid grid-cols-4 gap-2">
				{keys.map((key, i) => {
					const keyConfig = typeof key === "string" ? { label: key, value: key, type: "number" } : key;
					const isOperator = keyConfig.type === "operator";
					const isAction = keyConfig.type === "action";
					const isNumber = keyConfig.type === "number";

					return (
						<button
							key={i}
							type="button"
							onClick={() => onKeyPress(keyConfig.value || keyConfig.label)}
							className={`h-16 rounded-lg flex items-center justify-center text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors
                                ${isOperator ? "bg-indigo-500 text-white hover:bg-indigo-600" : ""}
                                ${isNumber || isAction ? "bg-slate-700 text-white hover:bg-slate-600" : ""}
                                `}
						>
							{keyConfig.icon ? <keyConfig.icon size={28} /> : keyConfig.label}
						</button>
					);
				})}
				<button
					type="button"
					onClick={onDone}
					className="col-span-4 h-16 rounded-lg flex items-center justify-center text-2xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-2"
				>
					OK
				</button>
			</div>
		</div>
	);
};

const CalculatorInput = ({ value, onChange, placeholder, ...props }) => {
	const isMobile = useIsMobile();
	const [showKeypad, setShowKeypad] = useState(false);
	const [displayValue, setDisplayValue] = useState(value || "");
	const inputRef = useRef(null);

	useEffect(() => {
		setDisplayValue(value || "");
	}, [value]);

	const handleKeyPress = (key) => {
		if (key === "backspace") {
			setDisplayValue((v) => v.slice(0, -1));
		} else {
			setDisplayValue((v) => v + key);
		}
	};

	const handleDone = () => {
		let result = 0;
		try {
			if (displayValue) {
				result = new Function(`return ${displayValue.replace(/×/g, "*").replace(/÷/g, "/")}`)();
			}
		} catch (e) {
			result = parseFloat(displayValue) || 0;
		}
		onChange({ target: { value: String(result || "") } });
		setShowKeypad(false);
		inputRef.current?.blur();
	};

	const handleFocus = (e) => {
		if (isMobile) {
			e.target.blur();
			setShowKeypad(true);
		}
	};

	return (
		<div className="relative">
			<input
				ref={inputRef}
				type="text"
				inputMode={isMobile ? "none" : "decimal"}
				value={value}
				onFocus={handleFocus}
				readOnly={isMobile}
				onChange={onChange}
				placeholder={placeholder}
				className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
				{...props}
			/>
			{isMobile && showKeypad && (
				<>
					<div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={handleDone}></div>
					<CalculatorKeypad onKeyPress={handleKeyPress} onDone={handleDone} displayValue={displayValue} />
				</>
			)}
		</div>
	);
};

export default CalculatorInput;
