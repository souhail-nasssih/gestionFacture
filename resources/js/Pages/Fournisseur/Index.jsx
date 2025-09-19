import DataTable from "@/Components/ui/DataTable";
import FormBuilder from "@/Components/ui/FormBuilder";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Edit2, PlusCircle, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import Edit from "../Profile/Edit";
import { Link, usePage } from "@inertiajs/react";

export default function Index({ fournisseurs }) {
    const { props } = usePage();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFournisseur, setSelectedFournisseur] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formValues, setFormValues] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Close form when the page loads (after redirect from store/update)
    useEffect(() => {
        setShowForm(false);
        setFormValues(null);
    }, [fournisseurs]);

    const handleFormSuccess = () => {
        setFormValues(null);
    };

    const fields = [
        {
            name: "nom",
            label: "Nom du Fournisseur",
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
            name: "adresse",
            label: "Adresse",
            type: "textarea",
            required: false,
        },
        {
            name: "delai_paiement",
            label: "Délai de Paiement (en jours)",
            type: "number",
            min: 0,
            required: true,
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
                            setSelectedFournisseur(item);
                            setShowDeleteModal(true);
                        }}
                        className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        title="Supprimer"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Success message display - safe check for flash */}
                    {props?.flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {props.flash.success}
                        </div>
                    )}

                    {/* Carte pour le titre et le bouton */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Gestion des Fournisseurs
                            </h2>
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
                                        <span>Ajouter un Fournisseur</span>
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
                                              "fournisseurs.update",
                                              formValues.id
                                          )
                                        : route("fournisseurs.store")
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
                        <DataTable
                            columns={columns}
                            data={fournisseurs.data}
                            searchable
                            sortable
                            pagination={false}
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
                                    Fournisseur "{selectedFournisseur?.nom}" ?
                                    Cette action est irréversible.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Annuler
                                    </button>
                                    <Link
                                        href={route(
                                            "fournisseurs.destroy",
                                            selectedFournisseur?.id
                                        )}
                                        method="delete"
                                        as="button"
                                        className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        onSuccess={() => {
                                            setShowDeleteModal(false);
                                        }}
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
