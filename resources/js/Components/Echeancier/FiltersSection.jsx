export default function FiltersSection({
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    searchTerm,
    setSearchTerm,
    statusOptions
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Gestion de Paiement
            </h2>

            <div className="flex flex-col gap-6">
                {/* First row: Type filter and Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <label className="font-medium text-gray-700 dark:text-gray-300">
                            Filtrer par type:
                        </label>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                            <button
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    selectedType === 'tous'
                                        ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300'
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                                onClick={() => setSelectedType('tous')}
                            >
                                Tous
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    selectedType === 'client'
                                        ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300'
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                                onClick={() => setSelectedType('client')}
                            >
                                Clients
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium rounded-md ${
                                    selectedType === 'fournisseur'
                                        ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-300'
                                        : 'text-gray-600 dark:text-gray-300'
                                }`}
                                onClick={() => setSelectedType('fournisseur')}
                            >
                                Fournisseurs
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Rechercher par nom ou n° facture"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Second row: Status filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                        Filtrer par statut:
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                            <button
                                key={status.value}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    selectedStatus === status.value
                                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                                onClick={() => setSelectedStatus(status.value)}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
