import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Edit, Trash2, Plus, X, PlusCircle } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import FormBuilder from "@/Components/ui/FormBuilder";
import DataTable from "@/Components/ui/DataTable";

export default function Produits({ produits }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduit, setSelectedProduit] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const fields = [
        {
            name: "nom",
            label: "Nom du produit",
            type: "text",
            required: true,
        },

        {
            name: "prix_achat",
            label: "Prix d'achat",
            type: "number",
            required: true,
        },
        {
            name: "prix_vente",
            label: "Prix de vente",
            type: "number",
            required: true,
        },
        {
            name: "stock",
            label: "Quantité en stock",
            type: "number",
            required: true,
        },
        {
            name: "unite",
            label: "Unité",
            type: "select",
            options: [
                { value: "kg", label: "Kilogramme" },
                { value: "g", label: "Gramme" },
                { value: "L", label: "Litre" },
                { value: "ml", label: "Millilitre" },
                { value: "pcs", label: "Pièce" },
            ],
            required: true,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
        },
    ];

    const columns = [
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
            key: "description",
            title: "Description",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {item.description || "N/A"}
                </span>
            ),
        },
        {
            key: "prix_achat",
            title: "Prix Achat",
            render: (item) => (
                <span className="text-red-600 dark:text-red-400">
                    {item.prix_achat.toFixed(2)} €
                </span>
            ),
        },
        {
            key: "prix_vente",
            title: "Prix Vente",
            render: (item) => (
                <span className="text-green-600 dark:text-green-400">
                    {item.prix_vente.toFixed(2)} €
                </span>
            ),
        },
        {
            key: "marge",
            title: "Marge",
            render: (item) => {
                const marge = item.prix_vente - item.prix_achat;
                const margePercent = ((marge / item.prix_achat) * 100).toFixed(
                    1
                );
                return (
                    <div>
                        <span className="block text-indigo-600 dark:text-indigo-400">
                            {marge.toFixed(2)} €
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {margePercent}%
                        </span>
                    </div>
                );
            },
        },
        {
            key: "stock",
            title: "Stock",
            render: (item) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.stock > 10
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : item.stock > 0
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                >
                    {item.stock} {item.unite}
                </span>
            ),
        },
        {
            key: "actions",
            title: "Actions",
            render: (item) => (
                <div className="flex space-x-2">
                    <Link
                        href={route("produits.edit", item.id)}
                        className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        <Edit className="h-5 w-5" />
                    </Link>
                    <button
                        onClick={() => {
                            setSelectedProduit(item);
                            setShowDeleteModal(true);
                        }}
                        className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Carte pour le titre et le bouton */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Gestion des Produits
                            </h2>

                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                            >
                                {showForm ? (
                                    <>
                                        <X className="h-4 w-4 mr-2" />
                                        Annuler
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Ajouter un produit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Formulaire d'ajout (dans sa propre carte si visible) */}
                    {showForm && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-all duration-300">
                            <FormBuilder
                                fields={fields}
                                onSubmit={"#"}
                                submitText="Créer"
                                resetText="Réinitialiser"
                            />
                        </div>
                    )}

                    {/* Carte pour le tableau */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <DataTable
                            columns={columns}
                            data={produits}
                            searchable
                            sortable
                            pagination
                        />
                    </div>

                    {/* Modal de suppression */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Confirmer la suppression
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Êtes-vous sûr de vouloir supprimer le
                                    produit "{selectedProduit?.nom}" ? Cette
                                    action est irréversible.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Annuler
                                    </button>
                                    <Link
                                        href={route(
                                            "produits.destroy",
                                            selectedProduit?.id
                                        )}
                                        method="delete"
                                        as="button"
                                        className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        Supprimer
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
