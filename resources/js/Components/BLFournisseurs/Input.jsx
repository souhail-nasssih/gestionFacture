import React from 'react';

const Input = React.forwardRef(({
    type = 'text',
    id,
    name,
    value,
    onChange,
    className = '',
    error,
    required = false,
    min,
    step,
    ...props
}, ref) => {
    return (
        <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            min={min}
            step={step}
            ref={ref}
            className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            } ${className}`}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export default Input;
