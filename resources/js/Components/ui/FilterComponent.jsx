import { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { X, Filter as FilterIcon, Calendar, ChevronDown } from 'lucide-react';
import { router } from '@inertiajs/react/types';

const FilterComponent = ({
    filters = [],
    initialFilters = {},
    routeName,
    className = ''
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState(initialFilters);
    const [hasFilters, setHasFilters] = useState(false);

    useEffect(() => {
        // Vérifie si des filtres sont actifs
        const activeFilters = Object.values(localFilters).some(
            value => value !== null && value !== '' && value !== undefined
        );
        setHasFilters(activeFilters);
    }, [localFilters]);

    const handleFilterChange = (name, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = () => {
        router.get(route(routeName), localFilters, {
            preserveState: true,
            replace: true
        });
        setShowFilters(false);
    };

    const resetFilters = () => {
        const resetFilters = {};
        filters.forEach(filter => {
            resetFilters[filter.name] = '';
        });

        setLocalFilters(resetFilters);
        router.get(route(routeName), resetFilters, {
            preserveState: true,
            replace: true
        });
    };

    const renderFilterInput = (filter) => {
        switch (filter.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={localFilters[filter.name] || ''}
                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                        placeholder={filter.placeholder || `Filtrer par ${filter.label}`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                );

            case 'select':
                return (
                    <select
                        value={localFilters[filter.name] || ''}
                        onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Tous</option>
                        {filter.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'date':
                return (
                    <div className="relative">
                        <input
                            type="date"
                            value={localFilters[filter.name] || ''}
                            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                        <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                );

            case 'range':
                return (
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="number"
                            value={localFilters[`${filter.name}_min`] || ''}
                            onChange={(e) => handleFilterChange(`${filter.name}_min`, e.target.value)}
                            placeholder="Min"
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                            type="number"
                            value={localFilters[`${filter.name}_max`] || ''}
                            onChange={(e) => handleFilterChange(`${filter.name}_max`, e.target.value)}
                            placeholder="Max"
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                        hasFilters
                            ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                >
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filtres
                    {hasFilters && (
                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600 text-xs text-white">
                            {Object.values(localFilters).filter(v => v && v !== '').length}
                        </span>
                    )}
                </button>

                {hasFilters && (
                    <button
                        onClick={resetFilters}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Réinitialiser
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="absolute z-10 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Filtres avancés
                        </h3>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {filters.map(filter => (
                            <div key={filter.name}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {filter.label}
                                </label>
                                {renderFilterInput(filter)}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Réinitialiser
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Appliquer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterComponent;
