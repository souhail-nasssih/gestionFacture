import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const SearchableSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Sélectionner...",
    searchPlaceholder = "Rechercher...",
    className = "",
    error,
    required = false,
    disabled = false,
    displayKey = "label",
    valueKey = "value",
    searchKeys = ["label"], // Keys to search in
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filter options based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option => {
                return searchKeys.some(key => {
                    const fieldValue = option[key];
                    return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm.toLowerCase());
                });
            });
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, searchKeys]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchTerm("");
            }
        }
    };

    const handleSelect = (option) => {
        onChange(option[valueKey]);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("");
        setIsOpen(false);
        setSearchTerm("");
    };

    const getSelectedOption = () => {
        return options.find(option => option[valueKey] === value);
    };

    const selectedOption = getSelectedOption();

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`relative cursor-pointer rounded-md border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 ${
                    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
                onClick={handleToggle}
            >
                <div className="flex items-center justify-between px-3 py-2">
                    <span className={`block truncate ${!selectedOption ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                        {selectedOption ? selectedOption[displayKey] : placeholder}
                    </span>
                    <div className="flex items-center space-x-1">
                        {value && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-300 dark:border-gray-600 max-h-60 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={option[valueKey] || index}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                        value === option[valueKey] ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option[displayKey]}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                Aucun résultat trouvé
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};

export default SearchableSelect;
