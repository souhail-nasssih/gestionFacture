import React from 'react';
import { Edit2, Trash2 } from 'lucide-react'; // Add this import

export const clientFields = [
    {
        name: "nom",
        label: "Nom du Client",
        type: "text",
        required: true,
    },
    {
        name: "telephone",
        label: "Téléphone",
        type: "text",
        required: true,
    },
    {
        name: "email",
        label: "Email",
        type: "email",
        required: false,
    },
    {
        name: "delai_paiement",
        label: "Délai de Paiement (en jours)",
        type: "number",
        required: true,
        defaultValue: 30,
    },
    {
        name: "adresse",
        label: "Adresse",
        type: "textarea",
        required: false,
    },
];

export const clientColumns = [
    {
        key: "id",
        title: "ID",
        render: (item) => (
            <span className="font-mono text-gray-500 dark:text-gray-400">
                #{item.id}
            </span>
        ),
    },
    {
        key: "nom",
        title: "Nom",
        render: (item) => <span className="font-medium">{item.nom}</span>,
    },
    {
        key: "telephone",
        title: "Téléphone",
        render: (item) => (
            <span className="text-gray-600 dark:text-gray-300">
                {item.telephone || "N/A"}
            </span>
        ),
    },
    {
        key: "email",
        title: "Email",
        render: (item) => (
            <span className="text-gray-600 dark:text-gray-300">
                {item.email || "N/A"}
            </span>
        ),
    },
    {
        key: "adresse",
        title: "Adresse",
        render: (item) => (
            <span className="text-gray-600 dark:text-gray-300">
                {item.adresse || "N/A"}
            </span>
        ),
    },
    {
        key: "delai_paiement",
        title: "Délai de Paiement (jours)",
        render: (item) => (
            <span className="text-gray-600 dark:text-gray-300">
                {item.delai_paiement || "N/A"}
            </span>
        ),
    },
    {
        key: "actions",
        title: "Actions",
        render: (item, { onEdit, onDelete }) => (
            <div className="flex space-x-2">
                <button
                    onClick={() => onEdit(item)}
                    className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    <Edit2 className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onDelete(item)}
                    className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        ),
    },
];
