import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import debounce from 'lodash/debounce';
import {
    Edit,
    Trash2,
    Plus,
    X,
    PlusCircle,
    History,
    Calculator,
    Edit2,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import FormBuilder from "@/Components/ui/FormBuilder";
import DataTable from "@/Components/ui/DataTable";
import Pagination from "@/Components/ui/Pagination";

export default function Produits({ produits: produitsData, filters }) {
    const { props } = usePage();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduit, setSelectedProduit] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formValues, setFormValues] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [qmupData, setQmupData] = useState({});
    const [loadingQmup, setLoadingQmup] = useState({});
    const [currentPage, setCurrentPage] = useState(produitsData.current_page || 1);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isSearching, setIsSearching] = useState(false);

    // Fonction de debounce pour la recherche
    const handleSearch = debounce((value) => {
        setIsSearching(true);
        router.get(
            route('produits.index'),
            { search: value },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsSearching(false)
            }
        );
    }, 300);

    // Close form when produits data changes (after redirect)
    useEffect(() => {
        setShowForm(false);
        setFormValues(null);
    }, [produitsData]);

    const handleFormSuccess = () => {
        setFormValues(null);
        // The form will be closed by the useEffect
    };

    const fetchQmup = async (produitId) => {
        if (loadingQmup[produitId]) return;

        setLoadingQmup((prev) => ({ ...prev, [produitId]: true }));

        try {
            const response = await fetch(`/produits/${produitId}/qmup`);
            const data = await response.json();

            setQmupData((prev) => ({
                ...prev,
                [produitId]: data.qmup,
            }));
        } catch (error) {
            console.error("Erreur lors du calcul de la QMUP:", error);
        } finally {
            setLoadingQmup((prev) => ({ ...prev, [produitId]: false }));
        }
    };

    const fields = [
        {
            name: "reference",
            label: "Référence du produit",
            type: "text",
            required: true,
        },
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
            key: "reference",
            title: "Référence",
            render: (item) => (
                <span className="font-mono text-gray-600 dark:text-gray-300">
                    {item.reference}
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
                    {item.prix_achat.toFixed(2)} DHS
                </span>
            ),
        },
        {
            key: "prix_vente",
            title: "Prix Vente",
            render: (item) => (
                <span className="text-green-600 dark:text-green-400">
                    {item.prix_vente.toFixed(2)} DHS
                </span>
            ),
        },
        {
            key: "qmup",
            title: "QMUP",
            render: (item) => {
                const qmup = qmupData[item.id] || item.qmup;
                const isLoading = loadingQmup[item.id];

                return (
                    <div className="flex items-center space-x-2">
                        {isLoading ? (
                            <span className="text-gray-500 text-sm">
                                Calcul...
                            </span>
                        ) : qmup !== undefined ? (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {qmup.toFixed(2)} DHS
                            </span>
                        ) : (
                            <button
                                onClick={() => fetchQmup(item.id)}
                                className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                                title="Calculer QMUP"
                            >
                                <Calculator className="h-4 w-4" />
                            </button>
                        )}
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
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            setFormValues(item);
                            setShowForm(true);
                        }}
                        className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
                        title="Modifier"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedProduit(item);
                            setShowDeleteModal(true);
                        }}
                        className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        title="Supprimer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                        href={route("produits.historique", item.id)}
                        className="p-1 text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full"
                        title="Historique des achats"
                    >
                        <History className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => fetchQmup(item.id)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full"
                        title="Calculer QMUP"
                    >
                        <Calculator className="h-4 w-4 text-blue-600" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Success message display */}
                    {props?.flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {props.flash.success}
                        </div>
                    )}

                    {/* Carte pour le titre et le bouton */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    Gestion des Produits
                                </h2>
                                {/* Barre de recherche */}
                                <div className="relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSearchTerm(value);
                                                handleSearch(value);
                                            }}
                                            placeholder="Rechercher par nom, description, référence..."
                                            className="w-96 pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {isSearching && (
                                        <div className="absolute right-3 top-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowForm(!showForm);
                                    setFormValues(null);
                                }}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                            >
                                {showForm ? (
                                    <div className="flex items-center gap-2">
                                        <X className="h-4 w-4" />
                                        <span>Annuler</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <PlusCircle className="h-4 w-4" />
                                        <span>Ajouter un produit</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Formulaire d'ajout */}
                    {showForm && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-all duration-300">
                            <FormBuilder
                                fields={fields}
                                initialData={formValues || {}}
                                onSubmit={
                                    formValues?.id
                                        ? route(
                                              "produits.update",
                                              formValues.id
                                          )
                                        : route("produits.store")
                                }
                                submitText={
                                    formValues ? "Mettre à jour" : "Créer"
                                }
                                resetText="Réinitialiser"
                                onSuccess={handleFormSuccess}
                            />
                        </div>
                    )}

                    {/* Carte pour le tableau */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {produitsData.data.length > 0 ? (
                            <div>
                                <DataTable
                                    columns={columns}
                                    data={produitsData.data}
                                    searchable={false}
                                    sortable
                                    pagination={false}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 inline-flex">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucun produit trouvé</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun produit disponible.'}
                                </p>
                            </div>
                        )}

                        {produitsData.data.length > 0 && (
                            <div className="mt-4">
                                <Pagination
                                    links={produitsData.links}
                                    onPageChange={(page) => {
                                        router.get(
                                            route('produits.index', { page }),
                                            {},
                                            { preserveScroll: true, preserveState: true }
                                        );
                                    }}
                                />
                            </div>
                        )}

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
                                        onSuccess={() =>
                                            setShowDeleteModal(false)
                                        }
                                    >
                                        Supprimer
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
