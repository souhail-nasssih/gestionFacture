// resources/js/Pages/FacturesFournisseurs/Index.jsx
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import FactureForm from "../../Components/Facture/FactureForm";
import FactureTable from "../../Components/Facture/FactureTable";
import DeleteModal from "../../Components/Facture/DeleteModal";
import SuccessErrorBanner from "../../Components/Facture/SuccessErrorBanner";

export default function Index({
    facturesFournisseurs,
    fournisseurs,
    blFournisseurs,
    success,
    errors: pageErrors,
}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingFactureId, setEditingFactureId] = useState(null);
    const [editingFacture, setEditingFacture] = useState(null);

    const openCreateForm = () => {
        setIsEditing(false);
        setEditingFactureId(null);
        setEditingFacture(null); // Removed the undefined 'facture' variable
        setShowForm(true);
    };

    const handleEdit = (facture) => {
        setIsEditing(true);
        setEditingFactureId(facture.id);
        setEditingFacture(facture);
        setShowForm(true);
    };

    return (
        <AuthenticatedLayout>
            <div className="py-6 px-4 sm:px-0">
                <div className="mx-auto max-w-full overflow-x-hidden">
                    <SuccessErrorBanner success={success} errors={pageErrors} />

                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-4 mb-6 mx-2 sm:mx-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                Gestion des Factures Fournisseurs
                            </h2>
                            <button
                                onClick={openCreateForm}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Créer une Facture
                            </button>
                        </div>
                    </div>

                    {showForm && (
                        <FactureForm
                            isEditing={isEditing}
                            editingFactureId={editingFactureId}
                            fournisseurs={fournisseurs}
                            blFournisseurs={blFournisseurs}
                            initialData={editingFacture}
                            onClose={() => {
                                setShowForm(false);
                                setIsEditing(false);
                                setEditingFactureId(null);
                                setEditingFacture(null);
                            }}
                            onSuccess={() => {
                                setShowForm(false);
                                setIsEditing(false);
                                setEditingFactureId(null);
                                setEditingFacture(null);
                            }}
                        />
                    )}

                    <FactureTable
                        facturesFournisseurs={facturesFournisseurs}
                        onEdit={handleEdit}
                        onDelete={(facture) => {
                            setSelectedFacture(facture);
                            setShowDeleteModal(true);
                        }}
                    />

                    {showDeleteModal && (
                        <DeleteModal
                            facture={selectedFacture}
                            onClose={() => setShowDeleteModal(false)}
                            onSuccess={() => {
                                setShowDeleteModal(false);
                                setSelectedFacture(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
