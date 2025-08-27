import { useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function FactureForm({
    isEditing,
    editingFactureId,
    fournisseurs,
    blFournisseurs,
    onClose,
    onSuccess,
    initialData = null
}) {
    const [selectedFournisseur, setSelectedFournisseur] = useState(
        initialData?.fournisseur_id || null
    );
    const [filteredBlFournisseurs, setFilteredBlFournisseurs] = useState([]);
    const [selectedBLs, setSelectedBLs] = useState(
        initialData?.blFournisseurs || []
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        numero_facture: initialData?.numero_facture || "",
        date_facture: initialData?.date_facture || new Date().toISOString().split("T")[0],
        fournisseur_id: initialData?.fournisseur_id || "",
        blFournisseurs: initialData?.blFournisseurs || [],
        montant_total: initialData?.montant_total || 0,
    });

    // Initialize form when in edit mode
    useEffect(() => {
        if (isEditing && initialData) {
            setData({
                numero_facture: initialData.numero_facture,
                date_facture: initialData.date_facture,
                fournisseur_id: initialData.fournisseur_id,
                blFournisseurs: initialData.blFournisseurs,
                montant_total: initialData.montant_total,
            });
            setSelectedFournisseur(initialData.fournisseur_id);
            setSelectedBLs(initialData.blFournisseurs);

            // Filter BLs for the selected supplier
            if (initialData.fournisseur_id) {
                const filtered = blFournisseurs.filter(
                    (bl) => String(bl.fournisseur_id) === String(initialData.fournisseur_id)
                );
                setFilteredBlFournisseurs(filtered);
            }
        }
    }, [isEditing, initialData]);

    const handleFournisseurChange = (e) => {
        const fournisseurId = e.target.value;
        setSelectedFournisseur(fournisseurId);
        setData("fournisseur_id", fournisseurId);

        if (fournisseurId) {
            // Filter BLs for the selected supplier that aren't already associated with an invoice
            const filtered = blFournisseurs.filter(
                (bl) =>
                    String(bl.fournisseur_id) === String(fournisseurId) &&
                    bl.facture_fournisseur_id === null
            );
            setFilteredBlFournisseurs(filtered);
        } else {
            setFilteredBlFournisseurs([]);
        }

        // Reset selected BLs when changing supplier
        setSelectedBLs([]);
    };

    const toggleBLSelection = (blId) => {
        setSelectedBLs((prev) => {
            if (prev.includes(blId)) {
                return prev.filter((id) => id !== blId);
            } else {
                return [...prev, blId];
            }
        });
    };

    const calculateTotal = () => {
        let total = 0;
        filteredBlFournisseurs.forEach((bl) => {
            if (selectedBLs.includes(bl.id)) {
                total += bl.details.reduce(
                    (sum, detail) => sum + detail.quantite * detail.prix_unitaire,
                    0
                );
            }
        });
        return total.toFixed(2);
    };

    useEffect(() => {
        setData("blFournisseurs", selectedBLs);
        setData("montant_total", calculateTotal());
    }, [selectedBLs]);

    const handleSubmit = () => {
        const url = isEditing
            ? route("factures-fournisseurs.update", editingFactureId)
            : route("factures-fournisseurs.store");

        const requestOptions = {
            onSuccess: () => {
                onSuccess();
                reset();
                setSelectedFournisseur(null);
                setFilteredBlFournisseurs([]);
                setSelectedBLs([]);
            },
            onError: (errors) => {
                let errorMessage = "Erreurs de validation :\n";

                if (errors.numero_facture) {
                    errorMessage += `- Numéro facture: ${errors.numero_facture}\n`;
                }
                if (errors.date_facture) {
                    errorMessage += `- Date facture: ${errors.date_facture}\n`;
                }
                if (errors.fournisseur_id) {
                    errorMessage += `- Fournisseur: ${errors.fournisseur_id}\n`;
                }
                if (errors.blFournisseurs) {
                    errorMessage += `- BLs: ${errors.blFournisseurs}\n`;
                }

                alert(errorMessage);
            },
            preserveScroll: true,
        };

        if (isEditing) {
            put(url, data, requestOptions);
        } else {
            post(url, data, requestOptions);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-all duration-300 mb-6">
            <div className="space-y-4">
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
                            </h3>
                        </div>

                        {filteredBlFournisseurs.length === 0 ? (
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
                                                Montant (DH)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredBlFournisseurs.map((bl) => (
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
                                                    <span className="font-medium">
                                                        {bl.details
                                                            .reduce(
                                                                (sum, detail) =>
                                                                    sum + detail.quantite * detail.prix_unitaire,
                                                                0
                                                            )
                                                            .toFixed(2)} DH
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-right font-bold">
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
                        type="button"
                        onClick={handleSubmit}
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
            </div>
        </div>
    );
}
