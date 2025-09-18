import React, { useState, useEffect } from "react";
import { Edit2, PlusCircle, X } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ClientForm from "../../Components/Client/ClientForm";
import ClientTable from "../../Components/Client/ClientTable";
import DeleteModal from "../../Components/Client/DeleteModal";

export default function Client({ clients }) {
    const { props } = usePage();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formValues, setFormValues] = useState(null);

    // Close form when clients data changes (after redirect)
    useEffect(() => {
        setShowForm(false);
        setFormValues(null);
    }, [clients]);

    const handleFormSuccess = () => {
        setFormValues(null);
        // The form will be closed by the useEffect
    };

    const handleEdit = (client) => {
        setFormValues(client);
        setShowForm(true);
    };

    const handleDelete = (client) => {
        setSelectedClient(client);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const handleToggleForm = () => {
        setShowForm(!showForm);
        setFormValues(null);
    };

    return (
        <AuthenticatedLayout>
            <div className="py-6 px-4 sm:px-0">
                <div className="mx-auto max-w-full overflow-x-hidden">
                    {/* Success message display */}
                    {props?.flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
                            {props.flash.success}
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-4 mb-6 mx-2 sm:mx-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                Gestion des Clients
                            </h2>
                            <button
                                onClick={handleToggleForm}
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
                                        Ajouter un Client
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <ClientForm
                        showForm={showForm}
                        formValues={formValues}
                        onSubmit={
                            formValues?.id
                                ? route("clients.update", formValues.id)
                                : route("clients.store")
                        }
                        onSuccess={handleFormSuccess}
                        onCancel={() => setShowForm(false)}
                    />

                    <ClientTable
                        data={clients.data}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    <DeleteModal
                        showDeleteModal={showDeleteModal}
                        selectedClient={selectedClient}
                        onClose={handleCloseDeleteModal}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
