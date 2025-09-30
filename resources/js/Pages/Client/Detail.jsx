import React, { useState, useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    FileText,
    Calendar,
    Download,
    Printer,
    FileSpreadsheet,
    Search,
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Clock
} from "lucide-react";

export default function Detail({ auth, client, stats, factures, reglements }) {
    const [activeTab, setActiveTab] = useState('situation');
    const [searchFactures, setSearchFactures] = useState('');
    const [searchReglements, setSearchReglements] = useState('');
    const [currentPageFactures, setCurrentPageFactures] = useState(1);
    const [currentPageReglements, setCurrentPageReglements] = useState(1);
    const itemsPerPage = 10;

    // Filtrage et pagination des factures
    const filteredFactures = useMemo(() => {
        return factures.filter(facture =>
            facture.numero_facture.toLowerCase().includes(searchFactures.toLowerCase()) ||
            facture.statut_paiement.toLowerCase().includes(searchFactures.toLowerCase())
        );
    }, [factures, searchFactures]);

    const paginatedFactures = useMemo(() => {
        const startIndex = (currentPageFactures - 1) * itemsPerPage;
        return filteredFactures.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredFactures, currentPageFactures]);

    // Filtrage et pagination des règlements
    const filteredReglements = useMemo(() => {
        return reglements.filter(reglement =>
            (reglement.numero_reglement && reglement.numero_reglement.toLowerCase().includes(searchReglements.toLowerCase())) ||
            reglement.type_reglement.toLowerCase().includes(searchReglements.toLowerCase()) ||
            (reglement.description && reglement.description.toLowerCase().includes(searchReglements.toLowerCase()))
        );
    }, [reglements, searchReglements]);

    const paginatedReglements = useMemo(() => {
        const startIndex = (currentPageReglements - 1) * itemsPerPage;
        return filteredReglements.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredReglements, currentPageReglements]);

    // Colonnes pour le tableau des factures
    const factureColumns = [
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
            key: "statut_paiement",
            title: "Statut",
            render: (item) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.statut_paiement === 'payee'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : item.statut_paiement === 'impayee'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                }`}>
                    {item.statut_paiement === 'payee' ? 'Payée' :
                     item.statut_paiement === 'impayee' ? 'Impayée' : 'Partiellement payée'}
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
            key: "montant_regle",
            title: "Montant Payé",
            render: (item) => (
                <span className="font-medium text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                    }).format(item.montant_regle)}
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

    // Colonnes pour le tableau des règlements
    const reglementColumns = [
        {
            key: "numero_reglement",
            title: "N° Règlement",
            render: (item) => (
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                    {item.numero_reglement || 'N/A'}
                </span>
            ),
        },
        {
            key: "date_reglement",
            title: "Date Règlement",
            render: (item) => (
                <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(item.date_reglement).toLocaleDateString('fr-FR')}
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
            key: "montant_paye",
            title: "Montant Payé",
            render: (item) => (
                <span className="font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                    }).format(item.montant_paye)}
                </span>
            ),
        },
        {
            key: "description",
            title: "Description",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {item.description || 'N/A'}
                </span>
            ),
        },
        {
            key: "facture",
            title: "Facture Associée",
            render: (item) => (
                <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
                    {item.facture ? item.facture.numero_facture : 'N/A'}
                </span>
            ),
        }
    ];

    // Fonctions d'export professionnelles
    const handleExportPDF = () => {
        // Utiliser la route de téléchargement PDF HTML professionnel
        window.open(route('clients.export-pdf', client.id), '_blank');
    };

    const handleExportPDFNative = () => {
        // Utiliser la route de téléchargement PDF natif
        window.open(route('clients.export-pdf-native', client.id), '_blank');
    };

    const handleExportExcel = () => {
        // Utiliser la route de téléchargement Excel professionnel
        window.open(route('clients.export-excel', client.id), '_blank');
    };

    const handleExportCSV = () => {
        // Utiliser la route de téléchargement CSV
        window.open(route('clients.export-csv', client.id), '_blank');
    };

    const handlePrintPDF = () => {
        // Utiliser la route d'impression PDF professionnelle
        window.open(route('clients.print-pdf', client.id), '_blank');
    };

    const handlePrint = () => {
        // Créer une nouvelle fenêtre pour l'impression
        const printWindow = window.open('', '_blank');
        const printContent = generatePrintContent();

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Attendre que le contenu soit chargé puis imprimer
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    const generatePrintContent = () => {
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Détail Client - ${client.nom}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }

        .print-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
        }

        .header h1 {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 10px;
        }

        .header .subtitle {
            font-size: 14px;
            color: #7f8c8d;
        }

        .client-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            margin-bottom: 25px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }

        .client-info h2 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 16px;
        }

        .client-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }

        .client-details p {
            margin-bottom: 8px;
        }

        .client-details strong {
            color: #2c3e50;
            font-weight: 600;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            border-top: 4px solid #3498db;
        }

        .stat-card:nth-child(2) {
            border-top-color: #27ae60;
        }

        .stat-card:nth-child(3) {
            border-top-color: #e74c3c;
        }

        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 11px;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin: 25px 0 15px 0;
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        th {
            background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        td {
            padding: 10px 8px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 11px;
        }

        tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        tr:hover {
            background-color: #e8f4f8;
        }

        .amount {
            text-align: right;
            font-weight: bold;
            font-family: 'Courier New', monospace;
        }

        .status-paid {
            color: #27ae60;
            font-weight: bold;
        }

        .status-unpaid {
            color: #e74c3c;
            font-weight: bold;
        }

        .status-partial {
            color: #f39c12;
            font-weight: bold;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #7f8c8d;
            border-top: 1px solid #ecf0f1;
            padding-top: 15px;
        }

        .no-data {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            padding: 20px;
        }

        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .print-container {
                padding: 15mm;
            }

            .stat-card {
                break-inside: avoid;
            }

            table {
                break-inside: auto;
            }

            tr {
                break-inside: avoid;
                break-after: auto;
            }
        }
    </style>
</head>
<body>
    <div class="print-container">
        <div class="header">
            <h1>Détail Client - ${client.nom}</h1>
            <p class="subtitle">Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>

        <div class="client-info">
            <h2>Informations du Client</h2>
            <div class="client-details">
                <p><strong>Nom :</strong> ${client.nom}</p>
                <p><strong>Téléphone :</strong> ${client.telephone}</p>
                <p><strong>Email :</strong> ${client.email || 'Non renseigné'}</p>
                <p><strong>Adresse :</strong> ${client.adresse || 'Non renseignée'}</p>
                <p><strong>Délai de paiement :</strong> ${client.delai_paiement || 0} jours</p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.montant_total_factures)}</div>
                <div class="stat-label">Montant Total Factures</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.montant_total_paye)}</div>
                <div class="stat-label">Montant Total Payé</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.reste_a_payer)}</div>
                <div class="stat-label">Reste à Payer</div>
            </div>
        </div>

        <div class="section-title">Situation des Factures (${stats.nombre_factures})</div>
        ${factures.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>N° Facture</th>
                    <th>Date Facture</th>
                    <th>Date Échéance</th>
                    <th>Statut</th>
                    <th>Montant Total</th>
                    <th>Montant Payé</th>
                    <th>Reste à Payer</th>
                </tr>
            </thead>
            <tbody>
                ${factures.map(facture => `
                <tr>
                    <td>${facture.numero_facture}</td>
                    <td>${new Date(facture.date_facture).toLocaleDateString('fr-FR')}</td>
                    <td>${new Date(facture.date_echeance).toLocaleDateString('fr-FR')}</td>
                    <td class="status-${facture.statut_paiement}">${facture.statut_paiement === 'payee' ? 'Payée' : facture.statut_paiement === 'impayee' ? 'Impayée' : 'Partiellement payée'}</td>
                    <td class="amount">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(facture.montant_total)}</td>
                    <td class="amount">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(facture.montant_regle)}</td>
                    <td class="amount">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(facture.reste_a_payer)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<div class="no-data">Aucune facture trouvée pour ce client.</div>'}

        <div class="section-title">Historique des Règlements (${stats.nombre_reglements})</div>
        ${reglements.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>N° Règlement</th>
                    <th>Date Règlement</th>
                    <th>Type Règlement</th>
                    <th>Montant Payé</th>
                    <th>Description</th>
                    <th>Facture Associée</th>
                </tr>
            </thead>
            <tbody>
                ${reglements.map(reglement => `
                <tr>
                    <td>${reglement.numero_reglement || 'N/A'}</td>
                    <td>${new Date(reglement.date_reglement).toLocaleDateString('fr-FR')}</td>
                    <td>${reglement.type_reglement}</td>
                    <td class="amount">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(reglement.montant_paye)}</td>
                    <td>${reglement.description || 'N/A'}</td>
                    <td>${reglement.facture ? reglement.facture.numero_facture : 'N/A'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<div class="no-data">Aucun règlement trouvé pour ce client.</div>'}

        <div class="footer">
            <p>Document généré automatiquement par le système de gestion de factures</p>
            <p>Page imprimée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
    </div>
</body>
</html>
        `;
    };

    // Composant de pagination
    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Précédent
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Suivant
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Page <span className="font-medium">{currentPage}</span> sur{' '}
                            <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Précédent
                            </button>
                            {pages.map((page) => (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        page === currentPage
                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Suivant
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={`Détail Client - ${client.nom}`}
        >
            <Head title={`Détail Client - ${client.nom}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Bouton retour */}
                    <div className="mb-6">
                        <Link
                            href={route('clients.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour à la liste des clients
                        </Link>
                    </div>

                    {/* Informations du client */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                                <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {client.nom}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Informations du client
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {client.telephone}
                                </span>
                            </div>
                            {client.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {client.email}
                                    </span>
                                </div>
                            )}
                            {client.adresse && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {client.adresse}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Délai: {client.delai_paiement || 0} jours
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques financières */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Montant Total Factures
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'EUR'
                                        }).format(stats.montant_total_factures)}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Montant Total Payé
                                    </p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {new Intl.NumberFormat('fr-FR', {
                                            style: 'currency',
                                            currency: 'EUR'
                                        }).format(stats.montant_total_paye)}
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
                                        }).format(stats.reste_a_payer)}
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-orange-500" />
                            </div>
                        </div>
                    </div>

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
                                    Situation Factures ({stats.nombre_factures})
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
                                    Événements Règlement ({stats.nombre_reglements})
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Contenu des onglets */}
                    {activeTab === 'situation' && (
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                            {/* En-tête avec recherche et boutons d'export */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Situation des Factures
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher..."
                                                value={searchFactures}
                                                onChange={(e) => setSearchFactures(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handlePrintPDF}
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                            >
                                                <Printer className="h-4 w-4" />
                                                Imprimer
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleExportPDF}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                    title="PDF HTML professionnel (design moderne)"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    PDF HTML
                                                </button>
                                                <button
                                                    onClick={handleExportPDFNative}
                                                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                                    title="PDF natif (vrai PDF)"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    PDF Natif
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleExportExcel}
                                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                            >
                                                <FileSpreadsheet className="h-4 w-4" />
                                                Excel
                                            </button>
                                            <button
                                                onClick={handleExportCSV}
                                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                            >
                                                <FileText className="h-4 w-4" />
                                                CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tableau des factures */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            {factureColumns.map((column) => (
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
                                        {paginatedFactures.map((facture) => (
                                            <tr key={facture.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                {factureColumns.map((column) => (
                                                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                                        {column.render(facture)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPageFactures}
                                totalPages={Math.ceil(filteredFactures.length / itemsPerPage)}
                                onPageChange={setCurrentPageFactures}
                            />
                        </div>
                    )}

                    {activeTab === 'reglements' && (
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                            {/* En-tête avec recherche et boutons d'export */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Historique des Règlements
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher..."
                                                value={searchReglements}
                                                onChange={(e) => setSearchReglements(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handlePrintPDF}
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                            >
                                                <Printer className="h-4 w-4" />
                                                Imprimer
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleExportPDF}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                    title="PDF HTML professionnel (design moderne)"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    PDF HTML
                                                </button>
                                                <button
                                                    onClick={handleExportPDFNative}
                                                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                                    title="PDF natif (vrai PDF)"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    PDF Natif
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleExportExcel}
                                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                            >
                                                <FileSpreadsheet className="h-4 w-4" />
                                                Excel
                                            </button>
                                            <button
                                                onClick={handleExportCSV}
                                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                            >
                                                <FileText className="h-4 w-4" />
                                                CSV
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tableau des règlements */}
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
                                        {paginatedReglements.map((reglement) => (
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

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPageReglements}
                                totalPages={Math.ceil(filteredReglements.length / itemsPerPage)}
                                onPageChange={setCurrentPageReglements}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
