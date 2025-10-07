import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";
import { PlusCircle, X } from "lucide-react";
import { useState } from "react";
import BLClientForm from "../../Components/BLClients/BLClientForm";
import BLClientTable from "../../Components/BLClients/BLClientTable";
import DeleteModal from "../../Components/BLClients/DeleteModal";

export default function Index({
    blClients,
    clients,
    produits,
    nextBlNumber,
    success,
    errors: pageErrors,
}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBlClient, setSelectedBlClient] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingBlId, setEditingBlId] = useState(null);

    const handleOpenCreateForm = () => {
        setIsEditing(false);
        setEditingBlId(null);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setIsEditing(false);
        setEditingBlId(null);
    };

    const handleEdit = (blClient) => {
        setIsEditing(true);
        setEditingBlId(blClient.id);
        setSelectedBlClient(blClient);
        setShowForm(true);
    };

    const handleDelete = (blClient) => {
        setSelectedBlClient(blClient);
        setShowDeleteModal(true);
    };

    const handlePrint = (blClient) => {
        // Open print route in new window
        window.open(route('bl-clients.print', blClient.id), '_blank');
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setIsEditing(false);
        setEditingBlId(null);
        setSelectedBlClient(null);
    };

    return (
        <AuthenticatedLayout>
            <div className="py-6 px-4 sm:px-0">
                <div className="mx-auto max-w-full overflow-x-hidden">
                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}

                    {pageErrors?.general && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            <span className="block sm:inline">
                                {pageErrors.general}
                            </span>
                        </div>
                    )}

                    {/* Header Section */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-4 mb-6 mx-2 sm:mx-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                Gestion des BL Clients
                            </h2>
                            <button
                                onClick={() => {
                                    showForm ? handleCancelForm() : handleOpenCreateForm();
                                }}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                            >
                                {showForm ? (
                                    <>
                                        <X className="h-4 w-4 mr-2" />
                                        {isEditing
                                            ? "Annuler la modification"
                                            : "Annuler"}
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Ajouter un BL Client
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Form Section */}
                    {showForm && (
                        <BLClientForm
                            clients={clients}
                            produits={produits}
                            isEditing={isEditing}
                            editingBl={selectedBlClient}
                            onCancel={handleCancelForm}
                            onSuccess={handleFormSuccess}
                            nextBlNumber={nextBlNumber}
                        />
                    )}

                    {/* Table Section */}
                    <BLClientTable
                        blClients={blClients}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPrint={handlePrint}
                    />

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <DeleteModal
                            bl={selectedBlClient}
                            onClose={() => setShowDeleteModal(false)}
                            routeName="bl-clients.destroy"
                            title="BL Client"
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
