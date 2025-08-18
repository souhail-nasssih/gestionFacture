import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";
import { PlusCircle, X } from "lucide-react";
import { useState } from "react";
import BLForm from "../../Components/BLFournisseurs/BLForm";
import BLTable from "../../Components/BLFournisseurs/BLTable";
import DeleteModal from "../../Components/BLFournisseurs/DeleteModal";

export default function Index({
    blFournisseurs,
    fournisseurs,
    produits,
    success,
    errors: pageErrors,
}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBlFournisseur, setSelectedBlFournisseur] = useState(null);
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

    const handleEdit = (blFournisseur) => {
        setIsEditing(true);
        setEditingBlId(blFournisseur.id);
        setSelectedBlFournisseur(blFournisseur);
        setShowForm(true);
    };

    const handleDelete = (blFournisseur) => {
        setSelectedBlFournisseur(blFournisseur);
        setShowDeleteModal(true);
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
                                Gestion des BL Fournisseurs
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
                                        Ajouter un BL Fournisseur
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Form Section */}
                    {showForm && (
                        <BLForm
                            fournisseurs={fournisseurs}
                            produits={produits}
                            isEditing={isEditing}
                            editingBl={selectedBlFournisseur}
                            onCancel={handleCancelForm}
                        />
                    )}

                    {/* Table Section */}
                    <BLTable
                        blFournisseurs={blFournisseurs}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <DeleteModal
                            bl={selectedBlFournisseur}
                            onClose={() => setShowDeleteModal(false)}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
