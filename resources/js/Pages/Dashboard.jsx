import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({
    stats,
    topClients,
    produitsStockBas
}) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD'
        }).format(amount);
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('fr-FR').format(number);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Chiffre d'affaires total */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chiffre d'Affaires</h3>
                        <div className="flex items-center">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats?.chiffreAffaires || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Total des factures clients
                    </p>
                </div>

                {/* Créances clients */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Créances Clients</h3>
                        <div className="flex items-center">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats?.creancesClients || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Factures non payées
                    </p>
                </div>

                {/* Trésorerie nette */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Trésorerie Nette</h3>
                        <div className="flex items-center">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                    <p className={`mt-2 text-3xl font-bold ${(stats?.tresorerieNette || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(stats?.tresorerieNette || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Créances - Dettes
                    </p>
                </div>

                {/* CA du mois */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">CA Ce Mois</h3>
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats?.caCeMois || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {stats?.evolutionCAMois !== undefined && (
                            <span className={`flex items-center ${stats.evolutionCAMois >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    {stats.evolutionCAMois >= 0 ? (
                                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    ) : (
                                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    )}
                                </svg>
                                {Math.abs(stats.evolutionCAMois)}% vs mois précédent
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Alertes critiques */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
                {/* Factures en retard */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Factures en Retard</h3>
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-red-600">
                        {formatNumber(stats?.facturesEnRetard || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Échéances dépassées
                    </p>
                </div>

                {/* Produits en rupture */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Produits en Rupture</h3>
                        <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-orange-600">
                        {formatNumber(stats?.produitsEnRupture || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Stock critique
                    </p>
                </div>
            </div>

            {/* Contenu principal en deux colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top clients */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Clients</h3>
                    <div className="space-y-4">
                        {topClients && topClients.length > 0 ? (
                            topClients.map((client, index) => (
                                <div key={client.id} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                                                <span className="text-sm font-medium">{index + 1}</span>
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {client.nom}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {client.factures_count} factures
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(client.montant_total_factures)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucun client trouvé</p>
                        )}
                    </div>
                </div>

                {/* Produits en rupture de stock */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Produits en Rupture</h3>
                    <div className="space-y-4">
                        {produitsStockBas && produitsStockBas.length > 0 ? (
                            produitsStockBas.map((produit) => (
                                <div key={produit.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {produit.nom}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Réf: {produit.reference}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-red-600">
                                            Stock: {produit.stock}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Seuil: {produit.seuil_alerte}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aucun produit en rupture</p>
                        )}
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
