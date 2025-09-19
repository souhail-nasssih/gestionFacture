import { Eye, Edit2, Trash2, Printer } from "lucide-react";
import { useState } from "react";
import React from "react";

const BLClientTable = ({ blClients, onEdit, onDelete, onPrint }) => {
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRowExpansion = (blId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(blId)) {
                newSet.delete(blId);
            } else {
                newSet.add(blId);
            }
            return newSet;
        });
    };

    const columns = [
        // {
        //     key: "id",
        //     title: "ID",
        //     render: (item) => (
        //         <span className="font-mono text-gray-500 dark:text-gray-400">
        //             #{item.id}
        //         </span>
        //     ),
        // },
        {
            key: "numero_bl",
            title: "Numéro BL",
            render: (item) => (
                <span className="font-medium">{item.numero_bl}</span>
            ),
        },
        {
            key: "date_bl",
            title: "Date BL",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {new Date(item.date_bl).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "client",
            title: "Client",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {item.client?.nom || "N/A"}
                </span>
            ),
        },
        {
            key: "details_count",
            title: "Nb. Articles",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {item.details?.length || 0}
                </span>
            ),
        },
        {
            key: "total_amount",
            title: "Montant Total",
            render: (item) => (
                <span className="font-medium">
                    {item.details
                        ?.reduce(
                            (sum, detail) =>
                                sum + parseFloat(detail.montant || 0),
                            0
                        )
                        .toFixed(2)}{" "}
                    DH
                </span>
            ),
        },
        {
            key: "actions",
            title: "Actions",
            render: (item) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => toggleRowExpansion(item.id)}
                        className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                        title={expandedRows.has(item.id) ? "Masquer les détails" : "Afficher les détails"}
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onPrint(item)}
                        className="p-1 text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full"
                        title="Imprimer"
                    >
                        <Printer className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                        title="Modifier"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(item)}
                        className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        title="Supprimer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    const renderRowDetails = (item) => {
        if (!expandedRows.has(item.id)) return null;

        return (
            <tr className="bg-gray-50 dark:bg-gray-700" key={`details-${item.id}`}>
                <td colSpan={columns.length} className="px-6 py-4">
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                            Détails du BL Client #{item.id}
                        </h4>
                        {item.details?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                    <thead className="bg-gray-100 dark:bg-gray-600">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Produit
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Quantité
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Prix unitaire
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Montant
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                        {item.details.map((detail, index) => (
                                            <tr key={detail.id || `${item.id}-detail-${index}`}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {detail.produit?.nom || `Produit ID: ${detail.produit_id}`}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {detail.quantite}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {detail.prix_unitaire} DH
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {parseFloat(detail.montant || 0).toFixed(2)} DH
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-100 dark:bg-gray-600">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-2 text-right font-bold text-sm text-gray-900 dark:text-gray-100">
                                                Total:
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap font-bold text-sm text-gray-900 dark:text-gray-100">
                                                {item.details
                                                    .reduce(
                                                        (sum, detail) =>
                                                            sum + parseFloat(detail.montant || 0),
                                                        0
                                                    )
                                                    .toFixed(2)} DH
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                Aucun détail disponible
                            </p>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-4">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {columns.map((column) => (
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
                        {blClients.data.map((item) => (
                            <React.Fragment key={item.id}>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    {columns.map((column) => (
                                        <td key={`${item.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                                            {column.render(item, { onEdit, onDelete })}
                                        </td>
                                    ))}
                                </tr>
                                {renderRowDetails(item)}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BLClientTable;
