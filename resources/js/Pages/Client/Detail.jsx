import React, { useState, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Calendar,
    Search,
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Clock,
    Printer,
    FileText,
    FileSpreadsheet
} from "lucide-react";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function Detail({ auth, client, stats, factures, reglements }) {
    const [activeTab, setActiveTab] = useState('situation');
    const [searchFactures, setSearchFactures] = useState('');
    const [searchReglements, setSearchReglements] = useState('');
    const [currentPageFactures, setCurrentPageFactures] = useState(1);
    const [currentPageReglements, setCurrentPageReglements] = useState(1);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
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
                    {new Intl.NumberFormat('fr-FR').format(item.montant_total)} DHS
                </span>
            ),
        },
        {
            key: "montant_regle",
            title: "Montant Payé",
            render: (item) => (
                <span className="font-medium text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat('fr-FR').format(item.montant_regle)} DHS
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
                    {new Intl.NumberFormat('fr-FR').format(item.reste_a_payer)} DHS
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
            title: "Créé le",
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
                    {new Intl.NumberFormat('fr-FR').format(item.montant_paye)} DHS
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

    // Fonctions d'impression
    const printFacturesTable = () => {
        const printWindow = window.open('', '_blank');
        const printContent = generateFacturesPrintContent();

        printWindow.document.write(printContent);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    const printReglementsTable = () => {
        const printWindow = window.open('', '_blank');
        const printContent = generateReglementsPrintContent();

        printWindow.document.write(printContent);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    const generateFacturesPrintContent = () => {
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factures Client - ${client.nom}</title>
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
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3498db;
        }

        .header h1 {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 10px;
        }

        .header p {
            color: #7f8c8d;
            font-size: 14px;
        }

        .client-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .client-info h2 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
        }

        .info-label {
            font-weight: bold;
            color: #34495e;
            margin-bottom: 5px;
        }

        .info-value {
            color: #2c3e50;
        }

        .stats-section {
            background: #e8f5e8;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .stats-section h2 {
            color: #27ae60;
            font-size: 18px;
            margin-bottom: 15px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }

        .stat-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-label {
            font-size: 12px;
            color: #7f8c8d;
            margin-bottom: 5px;
        }

        .stat-value {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
        }

        .section {
            margin-bottom: 30px;
        }

        .section h2 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #bdc3c7;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        th {
            background: #34495e;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }

        td {
            padding: 10px 8px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 11px;
        }

        tr:nth-child(even) {
            background: #f8f9fa;
        }

        .amount {
            text-align: right;
            font-weight: bold;
        }

        .status-payee {
            background: #d4edda;
            color: #155724;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
        }

        .status-impayee {
            background: #f8d7da;
            color: #721c24;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
        }

        .status-partial {
            background: #fff3cd;
            color: #856404;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
        }

        .no-data {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            padding: 20px;
        }

        @media print {
            body {
                padding: 0;
            }

            .header {
                margin-bottom: 20px;
            }

            .section {
                page-break-inside: avoid;
                margin-bottom: 20px;
            }

            table {
                page-break-inside: auto;
            }

            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
        }
    </style>
</head>
<body>
        <div class="header">
        <h1>📋 Factures Client</h1>
        <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>

        <div class="client-info">
        <h2>👤 Informations du Client</h2>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Nom :</span>
                <span class="info-value">${client.nom}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Téléphone :</span>
                <span class="info-value">${client.telephone || 'Non renseigné'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email :</span>
                <span class="info-value">${client.email || 'Non renseigné'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Adresse :</span>
                <span class="info-value">${client.adresse || 'Non renseignée'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Délai de paiement :</span>
                <span class="info-value">${client.delai_paiement || 0} jours</span>
            </div>
            </div>
        </div>

    <div class="stats-section">
        <h2>📊 Statistiques Financières</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">Montant Total Factures</div>
                <div class="stat-value">${new Intl.NumberFormat('fr-FR').format(stats.montant_total_factures)} DHS</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Montant Total Payé</div>
                <div class="stat-value">${new Intl.NumberFormat('fr-FR').format(stats.montant_total_paye)} DHS</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Reste à Payer</div>
                <div class="stat-value">${new Intl.NumberFormat('fr-FR').format(stats.reste_a_payer)} DHS</div>
            </div>
            </div>
        </div>

    <div class="section">
        <h2>🧾 Factures (${stats.nombre_factures})</h2>
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
                    <td class="amount">${new Intl.NumberFormat('fr-FR').format(facture.montant_total)} DHS</td>
                    <td class="amount">${new Intl.NumberFormat('fr-FR').format(facture.montant_regle)} DHS</td>
                    <td class="amount">${new Intl.NumberFormat('fr-FR').format(facture.reste_a_payer)} DHS</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<div class="no-data">Aucune facture trouvée pour ce client.</div>'}
    </div>
</body>
</html>
        `;
    };

    const generateReglementsPrintContent = () => {
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Règlements Client - ${client.nom}</title>
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
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3498db;
        }

        .header h1 {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 10px;
        }

        .header p {
            color: #7f8c8d;
            font-size: 14px;
        }

        .client-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .client-info h2 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
        }

        .info-label {
            font-weight: bold;
            color: #34495e;
            margin-bottom: 5px;
        }

        .info-value {
            color: #2c3e50;
        }

        .section {
            margin-bottom: 30px;
        }

        .section h2 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #bdc3c7;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        th {
            background: #34495e;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }

        td {
            padding: 10px 8px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 11px;
        }

        tr:nth-child(even) {
            background: #f8f9fa;
        }

        .amount {
            text-align: right;
            font-weight: bold;
        }

        .no-data {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            padding: 20px;
        }

        @media print {
            body {
                padding: 0;
            }

            .header {
                margin-bottom: 20px;
            }

            .section {
                page-break-inside: avoid;
                margin-bottom: 20px;
            }

            table {
                page-break-inside: auto;
            }

            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>💰 Règlements Client</h1>
        <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
    </div>

    <div class="client-info">
        <h2>👤 Informations du Client</h2>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Nom :</span>
                <span class="info-value">${client.nom}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Téléphone :</span>
                <span class="info-value">${client.telephone || 'Non renseigné'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email :</span>
                <span class="info-value">${client.email || 'Non renseigné'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Adresse :</span>
                <span class="info-value">${client.adresse || 'Non renseignée'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Délai de paiement :</span>
                <span class="info-value">${client.delai_paiement || 0} jours</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>💰 Historique des Règlements (${stats.nombre_reglements})</h2>
        ${reglements.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>N° Règlement</th>
                    <th>Créé le</th>
                    <th>Type</th>
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
                    <td class="amount">${new Intl.NumberFormat('fr-FR').format(reglement.montant_paye)} DHS</td>
                    <td>${reglement.description || 'N/A'}</td>
                    <td>${reglement.facture ? reglement.facture.numero_facture : 'N/A'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<div class="no-data">Aucun règlement trouvé pour ce client.</div>'}
    </div>
</body>
</html>
        `;
    };

    // Fonctions de génération PDF professionnel avec jsPDF
    const downloadFacturesPdf = () => {
        setIsGeneratingPdf(true);

        // Utiliser setTimeout pour permettre à l'UI de se mettre à jour
        setTimeout(() => {
            try {
                const doc = new jsPDF();
                let yPosition = 20;

        // En-tête professionnel
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('RAPPORT DES FACTURES CLIENT', 20, yPosition);
        yPosition += 10;

        // Date de génération
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, yPosition);
        yPosition += 20;

        // Informations client
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMATIONS DU CLIENT', 20, yPosition);
        yPosition += 8;

        // Ligne de séparation
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nom: ${client.nom}`, 20, yPosition);
        doc.text(`Téléphone: ${client.telephone || 'Non renseigné'}`, 110, yPosition);
        yPosition += 6;
        doc.text(`Email: ${client.email || 'Non renseigné'}`, 20, yPosition);
        doc.text(`Délai de paiement: ${client.delai_paiement || 0} jours`, 110, yPosition);
        yPosition += 6;
        doc.text(`Adresse: ${client.adresse || 'Non renseignée'}`, 20, yPosition);
        yPosition += 15;

        // Tableau des factures
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`FACTURES (${stats.nombre_factures})`, 20, yPosition);
        yPosition += 8;

        // Ligne de séparation
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;

        if (factures.length > 0) {
            // En-têtes du tableau
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('N° Facture', 20, yPosition);
            doc.text('Date Facture', 50, yPosition);
            doc.text('Date Échéance', 80, yPosition);
            doc.text('Statut', 110, yPosition);
            doc.text('Montant Total', 140, yPosition);
            doc.text('Montant Payé', 170, yPosition);
            yPosition += 6;

            // Ligne de séparation
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 6;

            // Données du tableau
            doc.setFont('helvetica', 'normal');
            factures.forEach((facture, index) => {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.text(facture.numero_facture, 20, yPosition);
                doc.text(new Date(facture.date_facture).toLocaleDateString('fr-FR'), 50, yPosition);
                doc.text(new Date(facture.date_echeance).toLocaleDateString('fr-FR'), 80, yPosition);
                doc.text(facture.statut_paiement === 'payee' ? 'Payée' : facture.statut_paiement === 'impayee' ? 'Impayée' : 'Partiel', 110, yPosition);
                doc.text(`${new Intl.NumberFormat('fr-FR').format(facture.montant_total)} DHS`, 140, yPosition);
                doc.text(`${new Intl.NumberFormat('fr-FR').format(facture.montant_regle)} DHS`, 170, yPosition);
                yPosition += 6;
            });

            // Ligne de séparation après le tableau
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 10;
        } else {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('Aucune facture trouvée pour ce client.', 20, yPosition);
            yPosition += 15;
        }

        // Statistiques financières (après le tableau)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RÉSUMÉ FINANCIER', 20, yPosition);
        yPosition += 8;

        // Ligne de séparation
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Montant Total des Factures: ${new Intl.NumberFormat('fr-FR').format(stats.montant_total_factures)} DHS`, 20, yPosition);
        yPosition += 6;
        doc.text(`Montant Total Payé: ${new Intl.NumberFormat('fr-FR').format(stats.montant_total_paye)} DHS`, 20, yPosition);
        yPosition += 6;
        doc.text(`Reste à Payer: ${new Intl.NumberFormat('fr-FR').format(stats.reste_a_payer)} DHS`, 20, yPosition);
        yPosition += 6;
        doc.text(`Nombre de Factures: ${stats.nombre_factures}`, 20, yPosition);

        // Téléchargement
        doc.save(`Factures_${client.nom}_${new Date().toISOString().split('T')[0]}.pdf`);

        // Arrêter le loading
        setIsGeneratingPdf(false);
            } catch (error) {
                console.error('Erreur lors de la génération du PDF:', error);
                setIsGeneratingPdf(false);
                alert('Erreur lors de la génération du PDF');
            }
        }, 100);
    };

    const downloadReglementsPdf = () => {
        setIsGeneratingPdf(true);

        // Utiliser setTimeout pour permettre à l'UI de se mettre à jour
        setTimeout(() => {
            try {
                const doc = new jsPDF();
                let yPosition = 20;

        // En-tête professionnel
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('RAPPORT DES RÈGLEMENTS CLIENT', 20, yPosition);
        yPosition += 10;

        // Date de génération
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, yPosition);
        yPosition += 20;

        // Informations client
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMATIONS DU CLIENT', 20, yPosition);
        yPosition += 8;

        // Ligne de séparation
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nom: ${client.nom}`, 20, yPosition);
        doc.text(`Téléphone: ${client.telephone || 'Non renseigné'}`, 110, yPosition);
        yPosition += 6;
        doc.text(`Email: ${client.email || 'Non renseigné'}`, 20, yPosition);
        doc.text(`Délai de paiement: ${client.delai_paiement || 0} jours`, 110, yPosition);
        yPosition += 6;
        doc.text(`Adresse: ${client.adresse || 'Non renseignée'}`, 20, yPosition);
        yPosition += 15;

        // Tableau des règlements
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`HISTORIQUE DES RÈGLEMENTS (${stats.nombre_reglements})`, 20, yPosition);
        yPosition += 8;

        // Ligne de séparation
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;

        if (reglements.length > 0) {
            // En-têtes du tableau
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('N° Règlement', 20, yPosition);
            doc.text('Créé le', 60, yPosition);
            doc.text('Type', 80, yPosition);
            doc.text('Montant', 100, yPosition);
            doc.text('Description', 130, yPosition);
            doc.text('Facture', 170, yPosition);
            yPosition += 6;

            // Ligne de séparation
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 6;

            // Données du tableau
            doc.setFont('helvetica', 'normal');
            reglements.forEach((reglement, index) => {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.text(reglement.numero_reglement || '-', 20, yPosition);
                doc.text(new Date(reglement.date_reglement).toLocaleDateString('fr-FR'), 60, yPosition);
                doc.text(reglement.type_reglement, 80, yPosition);
                doc.text(`${new Intl.NumberFormat('fr-FR').format(reglement.montant_paye)} DHS`, 100, yPosition);
                doc.text(reglement.description || '-', 130, yPosition);
                doc.text(reglement.facture ? reglement.facture.numero_facture : '-', 170, yPosition);
                yPosition += 6;
            });

            // Ligne de séparation après le tableau
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 10;
        } else {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('Aucun règlement trouvé pour ce client.', 20, yPosition);
            yPosition += 15;
        }

        // Résumé des règlements (après le tableau)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RÉSUMÉ DES RÈGLEMENTS', 20, yPosition);
        yPosition += 8;

        // Ligne de séparation
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const totalReglements = reglements.reduce((sum, reglement) => sum + parseFloat(reglement.montant_paye), 0);
        doc.text(`Montant Total des Règlements: ${new Intl.NumberFormat('fr-FR').format(totalReglements)} DHS`, 20, yPosition);
        yPosition += 6;
        doc.text(`Nombre de Règlements: ${stats.nombre_reglements}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Date du Premier Règlement: ${reglements.length > 0 ? new Date(reglements[reglements.length - 1].date_reglement).toLocaleDateString('fr-FR') : '-'}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Date du Dernier Règlement: ${reglements.length > 0 ? new Date(reglements[0].date_reglement).toLocaleDateString('fr-FR') : '-'}`, 20, yPosition);

        // Téléchargement
        doc.save(`Reglements_${client.nom}_${new Date().toISOString().split('T')[0]}.pdf`);

        // Arrêter le loading
        setIsGeneratingPdf(false);
            } catch (error) {
                console.error('Erreur lors de la génération du PDF:', error);
                setIsGeneratingPdf(false);
                alert('Erreur lors de la génération du PDF');
            }
        }, 100);
    };

    // Fonctions de génération Excel
    const downloadFacturesExcel = () => {
        setIsGeneratingExcel(true);

        // Utiliser setTimeout pour permettre à l'UI de se mettre à jour
        setTimeout(() => {
            try {
                // Créer un nouveau classeur
                const workbook = XLSX.utils.book_new();

        // Structure professionnelle avec tableaux bien conçus
        const structuredData = [
            // En-tête principal
            ['RAPPORT DES FACTURES CLIENT'],
            [''],
            ['Généré le', new Date().toLocaleDateString('fr-FR'), 'à', new Date().toLocaleTimeString('fr-FR')],
            [''],

            // Informations du client dans une seule cellule
            ['INFORMATIONS DU CLIENT'],
            [`Nom: ${client.nom} | Téléphone: ${client.telephone || '-'} | Email: ${client.email || '-'} | Adresse: ${client.adresse || '-'} | Délai de paiement: ${client.delai_paiement || 0} jours`],
            [''],

            // En-tête du tableau
            ['FACTURES'],
            [''],
            // En-têtes des colonnes du tableau
            ['N° Facture', 'Date Facture', 'Date Échéance', 'Statut', 'Montant Total (DHS)', 'Montant Payé (DHS)', 'Reste à Payer (DHS)']
        ];

        // Ajouter les données des factures
        factures.forEach(facture => {
            structuredData.push([
                facture.numero_facture,
                new Date(facture.date_facture).toLocaleDateString('fr-FR'),
                new Date(facture.date_echeance).toLocaleDateString('fr-FR'),
                facture.statut_paiement === 'payee' ? 'Payée' : facture.statut_paiement === 'impayee' ? 'Impayée' : 'Partiel',
                facture.montant_total,
                facture.montant_regle,
                facture.montant_total - facture.montant_regle
            ]);
        });

        // Ajouter les statistiques sous le tableau
        structuredData.push(['']);
        structuredData.push(['RÉSUMÉ FINANCIER']);
        structuredData.push(['Montant Total des Factures (DHS)', stats.montant_total_factures]);
        structuredData.push(['Montant Total Payé (DHS)', stats.montant_total_paye]);
        structuredData.push(['Reste à Payer (DHS)', stats.reste_a_payer]);
        structuredData.push(['Nombre de Factures', stats.nombre_factures]);

        // Créer la feuille avec les données structurées
        const newWorksheet = XLSX.utils.aoa_to_sheet(structuredData);

        // Ajuster la largeur des colonnes
        const columnWidths = [
            { wch: 20 }, // A - En-têtes et informations
            { wch: 15 }, // B - N° Facture
            { wch: 12 }, // C - Date Facture
            { wch: 12 }, // D - Date Échéance
            { wch: 10 }, // E - Statut
            { wch: 18 }, // F - Montant Total
            { wch: 18 }, // G - Montant Payé
            { wch: 18 }  // H - Reste à Payer
        ];
        newWorksheet['!cols'] = columnWidths;

        // Ajouter le style professionnel
        const range = XLSX.utils.decode_range(newWorksheet['!ref']);

        // Style pour l'en-tête principal (ligne 1)
        if (newWorksheet['A1']) {
            newWorksheet['A1'].s = {
                font: { bold: true, size: 16, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "2E86AB" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        // Style pour la date de génération (ligne 3)
        if (newWorksheet['A3']) {
            newWorksheet['A3'].s = {
                font: { italic: true, size: 10 },
                alignment: { horizontal: "left" }
            };
        }

        // Style pour les sections (INFORMATIONS DU CLIENT, FACTURES, RÉSUMÉ FINANCIER)
        const sectionRows = [5, 7, 9, structuredData.length - 5]; // Lignes des sections
        sectionRows.forEach(row => {
            const cell = newWorksheet[`A${row}`];
            if (cell) {
                cell.s = {
                    font: { bold: true, size: 12, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "34495E" } },
                    alignment: { horizontal: "left", vertical: "center" }
                };
            }
        });

        // Style pour les en-têtes du tableau (ligne 11)
        const headerRow = 11;
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
            const cell = newWorksheet[`${col}${headerRow}`];
            if (cell) {
                cell.s = {
                    font: { bold: true, size: 10, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "E74C3C" } },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    }
                };
            }
        });

        // Style pour les données du tableau (lignes 12+)
        for (let row = 12; row <= range.e.r; row++) {
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
                const cell = newWorksheet[`${col}${row}`];
                if (cell) {
                    cell.s = {
                        font: { size: 10 },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "CCCCCC" } },
                            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                            left: { style: "thin", color: { rgb: "CCCCCC" } },
                            right: { style: "thin", color: { rgb: "CCCCCC" } }
                        }
                    };

                    // Couleur de fond alternée pour les lignes
                    if (row % 2 === 0) {
                        cell.s.fill = { fgColor: { rgb: "F8F9FA" } };
                    }
                }
            });
        }

        // Style pour les statistiques (dernières lignes)
        const statsStartRow = structuredData.length - 4;
        for (let row = statsStartRow; row <= range.e.r; row++) {
            ['A', 'B'].forEach(col => {
                const cell = newWorksheet[`${col}${row}`];
                if (cell) {
                    cell.s = {
                        font: { size: 10 },
                        alignment: { horizontal: "left", vertical: "center" },
                        fill: { fgColor: { rgb: "ECF0F1" } }
                    };
                }
            });
        }

        // Ajouter la feuille au classeur
        XLSX.utils.book_append_sheet(workbook, newWorksheet, 'Factures');

        // Télécharger le fichier
        XLSX.writeFile(workbook, `Factures_${client.nom}_${new Date().toISOString().split('T')[0]}.xlsx`);

        // Arrêter le loading
        setIsGeneratingExcel(false);
            } catch (error) {
                console.error('Erreur lors de la génération du Excel:', error);
                setIsGeneratingExcel(false);
                alert('Erreur lors de la génération du fichier Excel');
            }
        }, 100);
    };

    const downloadReglementsExcel = () => {
        setIsGeneratingExcel(true);

        // Utiliser setTimeout pour permettre à l'UI de se mettre à jour
        setTimeout(() => {
            try {
                // Créer un nouveau classeur
                const workbook = XLSX.utils.book_new();

        // Structure professionnelle avec tableaux bien conçus
        const structuredData = [
            // En-tête principal
            ['RAPPORT DES RÈGLEMENTS CLIENT'],
            [''],
            ['Généré le', new Date().toLocaleDateString('fr-FR'), 'à', new Date().toLocaleTimeString('fr-FR')],
            [''],

            // Informations du client dans une seule cellule
            ['INFORMATIONS DU CLIENT'],
            [`Nom: ${client.nom} | Téléphone: ${client.telephone || '-'} | Email: ${client.email || '-'} | Adresse: ${client.adresse || '-'} | Délai de paiement: ${client.delai_paiement || 0} jours`],
            [''],

            // En-tête du tableau
            ['HISTORIQUE DES RÈGLEMENTS'],
            [''],
            // En-têtes des colonnes du tableau
            ['N° Règlement', 'Créé le', 'Type', 'Montant (DHS)', 'Description', 'Facture']
        ];

        // Ajouter les données des règlements
        reglements.forEach(reglement => {
            structuredData.push([
                reglement.numero_reglement || '-',
                new Date(reglement.date_reglement).toLocaleDateString('fr-FR'),
                reglement.type_reglement,
                reglement.montant_paye,
                reglement.description || '-',
                reglement.facture ? reglement.facture.numero_facture : '-'
            ]);
        });

        // Ajouter les statistiques sous le tableau
        structuredData.push(['']);
        structuredData.push(['RÉSUMÉ DES RÈGLEMENTS']);
        structuredData.push(['Montant Total des Règlements (DHS)', reglements.reduce((sum, reglement) => sum + parseFloat(reglement.montant_paye), 0)]);
        structuredData.push(['Nombre de Règlements', stats.nombre_reglements]);
        structuredData.push(['Date du Premier Règlement', reglements.length > 0 ? new Date(reglements[reglements.length - 1].date_reglement).toLocaleDateString('fr-FR') : '-']);
        structuredData.push(['Date du Dernier Règlement', reglements.length > 0 ? new Date(reglements[0].date_reglement).toLocaleDateString('fr-FR') : '-']);

        // Créer la feuille avec les données structurées
        const newWorksheet = XLSX.utils.aoa_to_sheet(structuredData);

        // Ajuster la largeur des colonnes
        const columnWidths = [
            { wch: 20 }, // A - En-têtes et informations
            { wch: 15 }, // B - N° Règlement
            { wch: 12 }, // C - Date
            { wch: 12 }, // D - Type
            { wch: 18 }, // E - Montant
            { wch: 20 }, // F - Description
            { wch: 15 }  // G - Facture
        ];
        newWorksheet['!cols'] = columnWidths;

        // Ajouter le style professionnel
        const range = XLSX.utils.decode_range(newWorksheet['!ref']);

        // Style pour l'en-tête principal (ligne 1)
        if (newWorksheet['A1']) {
            newWorksheet['A1'].s = {
                font: { bold: true, size: 16, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "8E44AD" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        // Style pour la date de génération (ligne 3)
        if (newWorksheet['A3']) {
            newWorksheet['A3'].s = {
                font: { italic: true, size: 10 },
                alignment: { horizontal: "left" }
            };
        }

        // Style pour les sections (INFORMATIONS DU CLIENT, HISTORIQUE DES RÈGLEMENTS, RÉSUMÉ DES RÈGLEMENTS)
        const sectionRows = [5, 7, 9, structuredData.length - 5]; // Lignes des sections
        sectionRows.forEach(row => {
            const cell = newWorksheet[`A${row}`];
            if (cell) {
                cell.s = {
                    font: { bold: true, size: 12, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "34495E" } },
                    alignment: { horizontal: "left", vertical: "center" }
                };
            }
        });

        // Style pour les en-têtes du tableau (ligne 11)
        const headerRow = 11;
        ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
            const cell = newWorksheet[`${col}${headerRow}`];
            if (cell) {
                cell.s = {
                    font: { bold: true, size: 10, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "E67E22" } },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    }
                };
            }
        });

        // Style pour les données du tableau (lignes 12+)
        for (let row = 12; row <= range.e.r; row++) {
            ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
                const cell = newWorksheet[`${col}${row}`];
                if (cell) {
                    cell.s = {
                        font: { size: 10 },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "CCCCCC" } },
                            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                            left: { style: "thin", color: { rgb: "CCCCCC" } },
                            right: { style: "thin", color: { rgb: "CCCCCC" } }
                        }
                    };

                    // Couleur de fond alternée pour les lignes
                    if (row % 2 === 0) {
                        cell.s.fill = { fgColor: { rgb: "F8F9FA" } };
                    }
                }
            });
        }

        // Style pour les statistiques (dernières lignes)
        const statsStartRow = structuredData.length - 4;
        for (let row = statsStartRow; row <= range.e.r; row++) {
            ['A', 'B'].forEach(col => {
                const cell = newWorksheet[`${col}${row}`];
                if (cell) {
                    cell.s = {
                        font: { size: 10 },
                        alignment: { horizontal: "left", vertical: "center" },
                        fill: { fgColor: { rgb: "ECF0F1" } }
                    };
                }
            });
        }

        // Ajouter la feuille au classeur
        XLSX.utils.book_append_sheet(workbook, newWorksheet, 'Règlements');

        // Télécharger le fichier
        XLSX.writeFile(workbook, `Reglements_${client.nom}_${new Date().toISOString().split('T')[0]}.xlsx`);

        // Arrêter le loading
        setIsGeneratingExcel(false);
            } catch (error) {
                console.error('Erreur lors de la génération du Excel:', error);
                setIsGeneratingExcel(false);
                alert('Erreur lors de la génération du fichier Excel');
            }
        }, 100);
    };

    // Composant de pagination
    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }

        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Précédent
                    </button>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
                            {pages.map((page) => (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        page === currentPage
                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    } ${page === 1 ? 'rounded-l-md' : ''} ${
                                        page === totalPages ? 'rounded-r-md' : ''
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('clients.index')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour à la liste
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Détail Client - {client.nom}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={`Détail Client - ${client.nom}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Informations du client */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-indigo-600" />
                                Informations du Client
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-gray-400" />
                            <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{client.nom}</p>
                            </div>
                        </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{client.telephone || 'Non renseigné'}</p>
                            </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{client.email || 'Non renseigné'}</p>
                                </div>
                            </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{client.adresse || 'Non renseignée'}</p>
                        </div>
                    </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Délai de paiement</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{client.delai_paiement || 0} jours</p>
                                </div>
                            </div>
                        </div>
                            </div>
                        </div>

                    {/* Statistiques financières */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Statistiques Financières
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Montant Total Factures</p>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {new Intl.NumberFormat('fr-FR').format(stats.montant_total_factures)} DHS
                                    </p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <p className="text-sm text-green-600 dark:text-green-400">Montant Total Payé</p>
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        {new Intl.NumberFormat('fr-FR').format(stats.montant_total_paye)} DHS
                                    </p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                                    <p className="text-sm text-orange-600 dark:text-orange-400">Reste à Payer</p>
                                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                        {new Intl.NumberFormat('fr-FR').format(stats.reste_a_payer)} DHS
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Onglets */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex">
                                <button
                                    onClick={() => setActiveTab('situation')}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                                        activeTab === 'situation'
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Situation Factures ({stats.nombre_factures})
                                </button>
                                <button
                                    onClick={() => setActiveTab('reglements')}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                                        activeTab === 'reglements'
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Événements Règlement ({stats.nombre_reglements})
                                </button>
                            </nav>
                    </div>

                    {activeTab === 'situation' && (
                        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                                {/* En-tête avec recherche */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            Factures du Client
                                    </h3>
                                        <div className="flex gap-2 items-center">
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
                                            <button
                                                onClick={printFacturesTable}
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                                title="Imprimer le tableau des factures"
                                            >
                                                <Printer className="h-4 w-4" />
                                                Imprimer
                                            </button>
                                                <button
                                                    onClick={downloadFacturesPdf}
                                                    disabled={isGeneratingPdf}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                                                        isGeneratingPdf
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-red-600 text-white hover:bg-red-700'
                                                    }`}
                                                    title="Télécharger le tableau des factures en PDF"
                                                >
                                                    {isGeneratingPdf ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Génération...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="h-4 w-4" />
                                                            PDF
                                                        </>
                                                    )}
                                                </button>
                                            <button
                                                    onClick={downloadFacturesExcel}
                                                    disabled={isGeneratingExcel}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                                                        isGeneratingExcel
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                                    title="Télécharger le tableau des factures en Excel"
                                                >
                                                    {isGeneratingExcel ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Génération...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileSpreadsheet className="h-4 w-4" />
                                                            Excel
                                                        </>
                                                    )}
                                                </button>
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
                                {/* En-tête avec recherche */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Historique des Règlements
                                    </h3>
                                        <div className="flex gap-2 items-center">
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
                                            <button
                                                onClick={printReglementsTable}
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                                title="Imprimer le tableau des règlements"
                                            >
                                                <Printer className="h-4 w-4" />
                                                Imprimer
                                            </button>
                                                <button
                                                    onClick={downloadReglementsPdf}
                                                    disabled={isGeneratingPdf}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                                                        isGeneratingPdf
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-red-600 text-white hover:bg-red-700'
                                                    }`}
                                                    title="Télécharger le tableau des règlements en PDF"
                                                >
                                                    {isGeneratingPdf ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Génération...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="h-4 w-4" />
                                                            PDF
                                                        </>
                                                    )}
                                                </button>
                                            <button
                                                    onClick={downloadReglementsExcel}
                                                    disabled={isGeneratingExcel}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                                                        isGeneratingExcel
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                                    title="Télécharger le tableau des règlements en Excel"
                                                >
                                                    {isGeneratingExcel ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Génération...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileSpreadsheet className="h-4 w-4" />
                                                            Excel
                                                        </>
                                                    )}
                                                </button>
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
            </div>
        </AuthenticatedLayout>
    );
}
