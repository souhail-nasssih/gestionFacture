// resources/js/Pages/Detail.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, Calendar, Download, Printer, FileSpreadsheet } from 'lucide-react';

export default function Detail({ auth }) {
    const [activeTab, setActiveTab] = useState('situation');

    // Données simulées pour la démonstration - SITUATION
    const situations = [
        {
            id: 1,
            numero_facture: "FAC-2024-001",
            date_facture: "2024-01-15",
            date_echeance: "2024-02-15",
            statut: "partiel",
            montant_total: 2500.00,
            montant_paye: 2000.00,
            reste_a_payer: 500.00
        },
        {
            id: 2,
            numero_facture: "FAC-2024-002",
            date_facture: "2024-01-20",
            date_echeance: "2024-02-20",
            statut: "payee",
            montant_total: 1800.00,
            montant_paye: 1800.00,
            reste_a_payer: 0.00
        },
        {
            id: 3,
            numero_facture: "FAC-2024-003",
            date_facture: "2024-01-25",
            date_echeance: "2024-02-25",
            statut: "impayee",
            montant_total: 3200.00,
            montant_paye: 0.00,
            reste_a_payer: 3200.00
        },
        {
            id: 4,
            numero_facture: "FAC-2024-004",
            date_facture: "2024-01-30",
            date_echeance: "2024-03-01",
            statut: "partiel",
            montant_total: 4500.00,
            montant_paye: 3000.00,
            reste_a_payer: 1500.00
        }
    ];

    // Données simulées pour la démonstration - RÈGLEMENTS
    const reglements = [
        {
            id: 1,
            date_creation: "2024-01-18",
            montant_ttc: 2000.00,
            type_reglement: "Virement bancaire",
            reference_reglement: "VIR-2024-001",
            reference_bancaire: "REF-BANK-001",
            statut: "validé"
        },
        {
            id: 2,
            date_creation: "2024-01-22",
            montant_ttc: 1800.00,
            type_reglement: "Chèque",
            reference_reglement: "CHQ-2024-045",
            reference_bancaire: "REF-BANK-045",
            statut: "validé"
        },
        {
            id: 3,
            date_creation: "2024-01-28",
            montant_ttc: 500.00,
            type_reglement: "Carte bancaire",
            reference_reglement: "CB-2024-789",
            reference_bancaire: "REF-BANK-789",
            statut: "en_attente"
        },
        {
            id: 4,
            date_creation: "2024-02-01",
            montant_ttc: 1500.00,
            type_reglement: "Espèces",
            reference_reglement: "ESP-2024-012",
            reference_bancaire: "N/A",
            statut: "validé"
        }
    ];

    // Colonnes pour le tableau SITUATION
    const situationColumns = [
        {
            key: "numero_facture",
            title: "N° Facture",
            render: (item) => (
                <span className="font-mono font-medium text-gray-900 dark:text-white">
                    {item.numero_facture}
                </span>
            ),
        },
        {
            key: "date_facture",
            title: "Date Facture",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {new Date(item.date_facture).toLocaleDateString('fr-FR')}
                </span>
            ),
        },
        {
            key: "date_echeance",
            title: "Date Échéance",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {new Date(item.date_echeance).toLocaleDateString('fr-FR')}
                </span>
            ),
        },
        {
            key: "statut",
            title: "Statut",
            render: (item) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.statut === 'payee'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : item.statut === 'impayee'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                }`}>
                    {item.statut === 'payee' ? 'Payée' : 
                     item.statut === 'impayee' ? 'Impayée' : 'Partiellement payée'}
                </span>
            ),
        },
        {
            key: "montant_total",
            title: "Montant Total",
            render: (item) => (
                <span className="font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                    }).format(item.montant_total)}
                </span>
            ),
        },
        {
            key: "montant_paye",
            title: "Montant Payé",
            render: (item) => (
                <span className="font-medium text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                    }).format(item.montant_paye)}
                </span>
            ),
        },
        {
            key: "reste_a_payer",
            title: "Reste à Payer",
            render: (item) => (
                <span className={`font-medium ${
                    item.reste_a_payer === 0 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                }`}>
                    {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                    }).format(item.reste_a_payer)}
                </span>
            ),
        }
    ];

    // Colonnes pour le tableau RÈGLEMENTS
    const reglementColumns = [
        {
            key: "date_creation",
            title: "Créé le",
            render: (item) => (
                <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(item.date_creation).toLocaleDateString('fr-FR')}
                </span>
            ),
        },
        {
            key: "montant_ttc",
            title: "Montant TTC",
            render: (item) => (
                <span className="font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                    }).format(item.montant_ttc)}
                </span>
            ),
        },
        {
            key: "type_reglement",
            title: "Type Règlement",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {item.type_reglement}
                </span>
            ),
        },
        {
            key: "reference_reglement",
            title: "Réf. Règlement",
            render: (item) => (
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                    {item.reference_reglement}
                </span>
            ),
        },
        {
            key: "reference_bancaire",
            title: "Réf. Bancaire",
            render: (item) => (
                <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                    {item.reference_bancaire}
                </span>
            ),
        },
        {
            key: "statut",
            title: "Statut",
            render: (item) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.statut === 'validé' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : item.statut === 'en_attente'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                    {item.statut}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Actions",
            render: (item) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleExportPDF(item, 'reglement')}
                        className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Imprimer PDF"
                    >
                        <Printer className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleExportExcel(item, 'reglement')}
                        className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        title="Exporter Excel"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                    </button>
                </div>
            ),
        }
    ];

    // Statistiques SITUATION
    const statsSituation = {
        montant_total: situations.reduce((sum, f) => sum + f.montant_total, 0),
        montant_paye: situations.reduce((sum, f) => sum + f.montant_paye, 0),
        reste_a_payer: situations.reduce((sum, f) => sum + f.reste_a_payer, 0),
    };

    // Statistiques RÈGLEMENTS
    const statsReglements = {
        total_ttc: reglements.reduce((sum, r) => sum + r.montant_ttc, 0),
        valide: reglements.filter(r => r.statut === 'validé').reduce((sum, r) => sum + r.montant_ttc, 0),
        en_attente: reglements.filter(r => r.statut === 'en_attente').reduce((sum, r) => sum + r.montant_ttc, 0),
    };

    // Fonctions d'exportation
    const handleExportPDF = (item, type) => {
        console.log(`Export PDF pour ${type}:`, item);
        // Implémentez l'export PDF ici
    };

    const handleExportExcel = (item, type) => {
        console.log(`Export Excel pour ${type}:`, item);
        // Implémentez l'export Excel ici
    };

    const handleExportAllPDF = (data, type) => {
        console.log(`Export PDF complet pour ${type}:`, data);
        // Implémentez l'export PDF complet ici
    };

    const handleExportAllExcel = (data, type) => {
        console.log(`Export Excel complet pour ${type}:`, data);
        // Implémentez l'export Excel complet ici
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header="Tableau de Bord Financier"
        >
            <Head title="Tableau de Bord Financier" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Navigation par onglets */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8 px-6">
                                <button
                                    onClick={() => setActiveTab('situation')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                        activeTab === 'situation'
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <FileText className="h-4 w-4" />
                                    Situation Factures
                                </button>
                                <button
                                    onClick={() => setActiveTab('reglements')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                        activeTab === 'reglements'
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Calendar className="h-4 w-4" />
                                    Événements Règlement
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Contenu des onglets */}
                    {activeTab === 'situation' && (
                        <div>
                            {/* Statistiques Situation */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Montant Total
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                }).format(statsSituation.montant_total)}
                                            </p>
                                        </div>
                                        <FileText className="h-8 w-8 text-blue-500" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Montant Payé
                                            </p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                }).format(statsSituation.montant_paye)}
                                            </p>
                                        </div>
                                        <Download className="h-8 w-8 text-green-500" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Reste à Payer
                                            </p>
                                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                }).format(statsSituation.reste_a_payer)}
                                            </p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-orange-500" />
                                    </div>
                                </div>
                            </div>

                            {/* En-tête du tableau avec boutons d'export */}
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Situation des Factures
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleExportAllPDF(situations, 'situation')}
                                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            <Printer className="h-4 w-4" />
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => handleExportAllExcel(situations, 'situation')}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Excel
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Tableau Situation */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                {situationColumns.map((column) => (
                                                    <th
                                                        key={column.key}
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                    >
                                                        {column.title}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {situations.map((situation) => (
                                                <tr key={situation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    {situationColumns.map((column) => (
                                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                                            {column.render(situation)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reglements' && (
                        <div>
                            {/* Statistiques Règlements */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Total TTC
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                }).format(statsReglements.total_ttc)}
                                            </p>
                                        </div>
                                        <FileText className="h-8 w-8 text-blue-500" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Validés
                                            </p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                }).format(statsReglements.valide)}
                                            </p>
                                        </div>
                                        <Download className="h-8 w-8 text-green-500" />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                En Attente
                                            </p>
                                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                {new Intl.NumberFormat('fr-FR', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                }).format(statsReglements.en_attente)}
                                            </p>
                                        </div>
                                        <Calendar className="h-8 w-8 text-orange-500" />
                                    </div>
                                </div>
                            </div>

                            {/* En-tête du tableau avec boutons d'export */}
                            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Historique des Règlements
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleExportAllPDF(reglements, 'reglements')}
                                            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            <Printer className="h-4 w-4" />
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => handleExportAllExcel(reglements, 'reglements')}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Excel
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Tableau Règlements */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                {reglementColumns.map((column) => (
                                                    <th
                                                        key={column.key}
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                    >
                                                        {column.title}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {reglements.map((reglement) => (
                                                <tr key={reglement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    {reglementColumns.map((column) => (
                                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                                            {column.render(reglement)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}