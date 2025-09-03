import { useForm } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";

export default function FactureForm({
    isEditing,
    editingFactureId,
    fournisseurs,
    blFournisseurs,
    onClose,
    onSuccess,
    initialData = null,
}) {
    const [selectedFournisseur, setSelectedFournisseur] = useState(
        initialData?.fournisseur_id || null
    );
    const [filteredBlFournisseurs, setFilteredBlFournisseurs] = useState([]);
    const [selectedBLs, setSelectedBLs] = useState(
        initialData?.bonsLivraison?.map(bl => bl.id) || []
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        numero_facture: initialData?.numero_facture || "",
        date_facture: initialData?.date_facture || new Date().toISOString().split("T")[0],
        fournisseur_id: initialData?.fournisseur_id || "",
        blFournisseurs: initialData?.bonsLivraison?.map(bl => bl.id) || [],
        montant_total: initialData?.montant_total || 0,
        bls_to_remove: [],
    });

    // Calcul du total avec useCallback pour éviter les rendus infinis
    const calculateTotal = useCallback(() => {
        let total = 0;
        filteredBlFournisseurs.forEach((bl) => {
            if (selectedBLs.includes(bl.id) && !data.bls_to_remove.includes(bl.id)) {
                total += bl.details.reduce(
                    (sum, detail) => sum + detail.quantite * detail.prix_unitaire,
                    0
                );
            }
        });
        return total.toFixed(2);
    }, [selectedBLs, filteredBlFournisseurs, data.bls_to_remove]);

    // Initialize form when in edit mode
    useEffect(() => {
        if (isEditing && initialData) {
            setData({
                numero_facture: initialData.numero_facture,
                date_facture: initialData.date_facture,
                fournisseur_id: initialData.fournisseur_id,
                blFournisseurs: initialData.bonsLivraison?.map(bl => bl.id) || [],
                montant_total: initialData.montant_total,
                bls_to_remove: [],
            });
            setSelectedFournisseur(initialData.fournisseur_id);
            setSelectedBLs(initialData.bonsLivraison?.map(bl => bl.id) || []);

            // Filter BLs for the selected supplier
            if (initialData.fournisseur_id) {
                const filtered = blFournisseurs.filter(
                    (bl) => String(bl.fournisseur_id) === String(initialData.fournisseur_id) &&
                    (bl.facture_fournisseur_id === null || bl.facture_fournisseur_id === initialData.id)
                );
                setFilteredBlFournisseurs(filtered);
            }
        }
    }, [isEditing, initialData, blFournisseurs]);

    const handleFournisseurChange = (e) => {
        const fournisseurId = e.target.value;
        setSelectedFournisseur(fournisseurId);
        setData("fournisseur_id", fournisseurId);

        if (fournisseurId) {
            const filtered = blFournisseurs.filter(
                (bl) => String(bl.fournisseur_id) === String(fournisseurId) &&
                (bl.facture_fournisseur_id === null ||
                 (isEditing && bl.facture_fournisseur_id === editingFactureId))
            );
            setFilteredBlFournisseurs(filtered);
        } else {
            setFilteredBlFournisseurs([]);
        }

        setSelectedBLs([]);
        setData("blFournisseurs", []);
        setData("bls_to_remove", []);
    };

    const toggleBLSelection = (blId) => {
        setSelectedBLs((prev) => {
            const newSelectedBLs = prev.includes(blId)
                ? prev.filter((id) => id !== blId)
                : [...prev, blId];

            setData("blFournisseurs", newSelectedBLs);
            return newSelectedBLs;
        });
    };

    // Fonction pour supprimer un BL déjà associé à cette facture
    const removeAssociatedBL = (blId) => {
        setSelectedBLs((prev) => {
            const newSelectedBLs = prev.filter((id) => id !== blId);
            setData("blFournisseurs", newSelectedBLs);

            // Ajouter le BL à la liste des BLs à supprimer
            setData("bls_to_remove", [...data.bls_to_remove, blId]);

            return newSelectedBLs;
        });
    };

    // Fonction pour annuler la suppression d'un BL
    const cancelRemoveBL = (blId) => {
        setData("bls_to_remove", data.bls_to_remove.filter(id => id !== blId));
        setSelectedBLs(prev => [...prev, blId]);
        setData("blFournisseurs", [...data.blFournisseurs, blId]);
    };

    // Mettre à jour le montant total seulement quand nécessaire
    useEffect(() => {
        const newTotal = calculateTotal();
        if (parseFloat(data.montant_total) !== parseFloat(newTotal)) {
            setData("montant_total", newTotal);
        }
    }, [calculateTotal, data.montant_total, setData]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Préparer les données pour correspondre à la validation Laravel
        const formData = {
            numero_facture: data.numero_facture,
            date_facture: data.date_facture,
            fournisseur_id: data.fournisseur_id,
            montant_total: data.montant_total,
            blFournisseurs: data.blFournisseurs,
            ...(isEditing && { bls_to_remove: data.bls_to_remove })
        };

        if (isEditing) {
            put(route("facture-fournisseurs.update", editingFactureId), {
                ...formData,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setSelectedFournisseur(null);
                    setFilteredBlFournisseurs([]);
                    setSelectedBLs([]);
                    onSuccess(); // Fermer le formulaire après modification réussie
                },
                onError: (errors) => {
                    console.error('Erreurs:', errors);
                }
            });
        } else {
            post(route("facture-fournisseurs.store"), {
                ...formData,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setSelectedFournisseur(null);
                    setFilteredBlFournisseurs([]);
                    setSelectedBLs([]);
                    onSuccess(); // Fermer le formulaire après ajout réussi
                },
                onError: (errors) => {
                    console.error('Erreurs:', errors);
                }
            });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-all duration-300 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {isEditing
                            ? `Modifier la Facture Fournisseur #${editingFactureId}`
                            : "Créer une nouvelle Facture Fournisseur"}
                    </h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Numéro Facture <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.numero_facture}
                        onChange={(e) => setData("numero_facture", e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                    />
                    {errors.numero_facture && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.numero_facture}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date Facture <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={data.date_facture}
                        onChange={(e) => setData("date_facture", e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                    />
                    {errors.date_facture && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.date_facture}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fournisseur <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.fournisseur_id}
                        onChange={handleFournisseurChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Sélectionner un fournisseur</option>
                        {fournisseurs.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.nom}
                            </option>
                        ))}
                    </select>
                    {errors.fournisseur_id && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.fournisseur_id}
                        </p>
                    )}
                </div>

                {selectedFournisseur && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                BLs du Fournisseur
                                {isEditing && (
                                    <span className="text-sm text-gray-500 ml-2">
                                        (Les BLs déjà associés à d'autres factures ne sont pas affichés)
                                    </span>
                                )}
                            </h3>
                        </div>

                        {/* Section des BLs déjà associés à cette facture */}
                        {isEditing && (
                            <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                    BLs actuellement associés à cette facture
                                </h4>
                                {filteredBlFournisseurs
                                    .filter(bl => bl.facture_fournisseur_id === editingFactureId)
                                    .length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        Aucun BL associé à cette facture
                                    </p>
                                ) : (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                        <div className="space-y-2">
                                            {filteredBlFournisseurs
                                                .filter(bl => bl.facture_fournisseur_id === editingFactureId)
                                                .map((bl) => {
                                                    const isMarkedForRemoval = data.bls_to_remove.includes(bl.id);

                                                    return (
                                                        <div key={bl.id} className={`flex items-center justify-between p-3 rounded border ${
                                                            isMarkedForRemoval
                                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                                                        }`}>
                                                            <div className="flex-1">
                                                                <span className="font-medium">{bl.numero_bl}</span>
                                                                <span className="text-gray-500 dark:text-gray-400 ml-3">
                                                                    {new Date(bl.date_bl).toLocaleDateString()} -
                                                                    {bl.details
                                                                        .reduce((sum, detail) => sum + detail.quantite * detail.prix_unitaire, 0)
                                                                        .toFixed(2)} DH
                                                                </span>
                                                                {isMarkedForRemoval && (
                                                                    <span className="ml-3 text-xs text-red-600 dark:text-red-400">
                                                                        (Sera supprimé)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {!isMarkedForRemoval && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeAssociatedBL(bl.id)}
                                                                        className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900 rounded-md transition-colors"
                                                                        title="Supprimer ce BL de la facture"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                                {isMarkedForRemoval && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => cancelRemoveBL(bl.id)}
                                                                        className="px-2 py-1 text-xs bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors"
                                                                        title="Annuler la suppression"
                                                                    >
                                                                        Annuler
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Section des BLs disponibles */}
                        <div className="mb-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                {isEditing ? "BLs disponibles à ajouter" : "Sélectionnez les BLs"}
                            </h4>

                            {filteredBlFournisseurs.filter(bl =>
                                bl.facture_fournisseur_id === null
                            ).length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    Aucun BL disponible pour ce fournisseur
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Sélection
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Numéro BL
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Date BL
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Statut
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Montant (DH)
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredBlFournisseurs
                                                .filter(bl => bl.facture_fournisseur_id === null)
                                                .map((bl) => (
                                                    <tr key={bl.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedBLs.includes(bl.id)}
                                                                onChange={() => toggleBLSelection(bl.id)}
                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="font-medium">
                                                                {bl.numero_bl}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                {new Date(bl.date_bl).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                Disponible
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="font-medium">
                                                                {bl.details
                                                                    .reduce(
                                                                        (sum, detail) => sum + detail.quantite * detail.prix_unitaire,
                                                                        0
                                                                    )
                                                                    .toFixed(2)}{" "}
                                                                DH
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-right font-bold">
                                                    Total sélectionné:
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    {calculateTotal()} DH
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {errors.blFournisseurs && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {errors.blFournisseurs}
                        </p>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={processing || selectedBLs.length === 0}
                        className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing
                            ? "Envoi..."
                            : isEditing
                            ? "Modifier"
                            : "Créer"}
                    </button>
                </div>
            </form>
        </div>
    );
}
