import React from 'react';

const Textarea = React.forwardRef(({
    id,
    name,
    value,
    onChange,
    className = '',
    error,
    required = false,
    placeholder,
    rows = 3,
    ...props
}, ref) => {
    return (
        <div className="w-full">
            <textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                rows={rows}
                ref={ref}
                className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 resize-vertical ${
                    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                } ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
