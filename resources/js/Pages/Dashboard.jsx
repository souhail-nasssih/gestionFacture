import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({
    stats,
    topClients,
    produitsStockBas,
    facturesRecentes,
    evolutionCA
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

                {/* Dettes fournisseurs */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dettes Fournisseurs</h3>
                        <div className="flex items-center">
                            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats?.dettesFournisseurs || 0)}
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
            </div>

            {/* Statistiques secondaires */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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

                {/* Nombre de clients */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Clients</h3>
                        <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(stats?.totalClients || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Clients actifs
                    </p>
                </div>

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

            {/* Statistiques tertiaires */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Factures du mois */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Factures Ce Mois</h3>
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(stats?.facturesCeMois || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Factures émises
                    </p>
                </div>

                {/* Total factures */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Factures</h3>
                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(stats?.totalFactures || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Toutes factures
                    </p>
                </div>

                {/* Montant moyen par facture */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Montant Moyen</h3>
                        <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats?.montantMoyenFacture || 0)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Par facture
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

            {/* Factures récentes */}
            <div className="mt-8">
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Factures Récentes</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        N° Facture
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Client
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Montant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Statut
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {facturesRecentes && facturesRecentes.length > 0 ? (
                                    facturesRecentes.map((facture) => (
                                        <tr key={facture.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {facture.numero_facture}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {facture.client?.nom}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {formatCurrency(facture.montant_total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    facture.statut_paiement === 'payée' || facture.statut_paiement === 'payee'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : facture.statut_paiement === 'en attente'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        : facture.statut_paiement === 'partiellement payée'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                }`}>
                                                    {facture.statut_paiement}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Aucune facture récente
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
