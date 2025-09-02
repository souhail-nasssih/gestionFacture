import React from 'react';

const Select = ({
    id,
    name,
    value,
    onChange,
    options = [],
    className = '',
    error,
    required = false,
    placeholder,
    ...props
}) => {
    return (
        <div className="w-full">
            <select
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                } ${className}`}
                {...props}
            >
                {placeholder && (
                    <option value="">{placeholder}</option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Select;
