import { useForm } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import SearchableSelect from "../ui/SearchableSelect";

export default function FactureClientForm({
    isEditing,
    editingFactureId,
    clients,
    blClients,
    onClose,
    onSuccess,
    initialData = null,
    nextNumeroFacture = null,
}) {
    const [selectedClient, setSelectedClient] = useState(
        initialData?.client_id || null
    );
    const [filteredBlClients, setFilteredBlClients] = useState([]);
    const [selectedBLs, setSelectedBLs] = useState(
        initialData?.bonsLivraison?.map(bl => bl.id) || []
    );
    const [sortField, setSortField] = useState('numero_bl');
    const [sortDirection, setSortDirection] = useState('asc');

    const TVA_RATE = 20; // Fixed TVA rate of 20%

    const { data, setData, post, put, processing, errors, reset } = useForm({
        numero_facture: initialData?.numero_facture || nextNumeroFacture || "",
        date_facture: initialData?.date_facture || new Date().toISOString().split("T")[0],
        client_id: initialData?.client_id || "",
        blClients: initialData?.bonsLivraison?.map(bl => bl.id) || [],
        montant_ht: initialData?.montant_ht || 0,
        tva: TVA_RATE, // Fixed TVA rate
        montant_total: initialData?.montant_total || 0,
        bls_to_remove: [],
    });

    // Calcul du total avec TVA fixe
    const calculateTotals = useCallback(() => {
        let montantHt = 0;
        filteredBlClients.forEach((bl) => {
            if (selectedBLs.includes(bl.id) && !data.bls_to_remove.includes(bl.id)) {
                montantHt += bl.details.reduce(
                    (sum, detail) => sum + detail.quantite * detail.prix_unitaire,
                    0
                );
            }
        });

        const tvaAmount = montantHt * (TVA_RATE / 100);
        const montantTtc = montantHt + tvaAmount;

        return {
            montantHt: montantHt.toFixed(2),
            tvaAmount: tvaAmount.toFixed(2),
            montantTtc: montantTtc.toFixed(2)
        };
    }, [selectedBLs, filteredBlClients, data.bls_to_remove]);

    useEffect(() => {
        if (isEditing && initialData) {
            setData({
                numero_facture: initialData.numero_facture,
                date_facture: initialData.date_facture,
                client_id: initialData.client_id,
                blClients: initialData.bonsLivraison?.map(bl => bl.id) || [],
                montant_ht: initialData.montant_ht || 0,
                tva: TVA_RATE, // Fixed TVA rate
                montant_total: initialData.montant_total || 0,
                bls_to_remove: [],
            });
            setSelectedClient(initialData.client_id);
            setSelectedBLs(initialData.bonsLivraison?.map(bl => bl.id) || []);

            if (initialData.client_id) {
                const filtered = blClients.filter(
                    (bl) => String(bl.client_id) === String(initialData.client_id) &&
                    (bl.facture_client_id === null || bl.facture_client_id === initialData.id)
                );
                setFilteredBlClients(filtered);
            }
        } else if (!isEditing && nextNumeroFacture) {
            // When creating a new facture, ensure the numero_facture is pre-filled
            setData('numero_facture', nextNumeroFacture);
        }
    }, [isEditing, initialData, blClients, nextNumeroFacture]);

    const toggleBLSelection = (blId) => {
        setSelectedBLs((prev) => {
            const newSelectedBLs = prev.includes(blId)
                ? prev.filter((id) => id !== blId)
                : [...prev, blId];

            setData("blClients", newSelectedBLs);
            return newSelectedBLs;
        });
    };

    const removeAssociatedBL = (blId) => {
        setSelectedBLs((prev) => {
            const newSelectedBLs = prev.filter((id) => id !== blId);
            setData("blClients", newSelectedBLs);
            setData("bls_to_remove", [...data.bls_to_remove, blId]);
            return newSelectedBLs;
        });
    };

    const cancelRemoveBL = (blId) => {
        setData("bls_to_remove", data.bls_to_remove.filter(id => id !== blId));
        setSelectedBLs(prev => [...prev, blId]);
        setData("blClients", [...data.blClients, blId]);
    };

    // Mettre à jour les montants quand nécessaire
    useEffect(() => {
        const { montantHt, montantTtc } = calculateTotals();

        if (parseFloat(data.montant_ht) !== parseFloat(montantHt)) {
            setData("montant_ht", montantHt);
        }

        if (parseFloat(data.montant_total) !== parseFloat(montantTtc)) {
            setData("montant_total", montantTtc);
        }
    }, [calculateTotals, data.montant_ht, data.montant_total, setData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            numero_facture: data.numero_facture,
            date_facture: data.date_facture,
            client_id: data.client_id,
            montant_ht: data.montant_ht,
            tva: TVA_RATE, // Fixed TVA rate
            montant_total: data.montant_total,
            blClients: data.blClients,
            ...(isEditing && { bls_to_remove: data.bls_to_remove })
        };

        if (isEditing) {
            put(route("facture-clients.update", editingFactureId), {
                ...formData,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setSelectedClient(null);
                    setFilteredBlClients([]);
                    setSelectedBLs([]);
                    onSuccess();
                },
            });
        } else {
            post(route("facture-clients.store"), {
                ...formData,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setSelectedClient(null);
                    setFilteredBlClients([]);
                    setSelectedBLs([]);
                    onSuccess();
                },
            });
        }
    };

    const { montantHt, tvaAmount, montantTtc } = calculateTotals();

    // Sorting function
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Get sorted BLs
    const getSortedBls = () => {
        const availableBls = filteredBlClients.filter(bl => bl.facture_client_id === null);

        return [...availableBls].sort((a, b) => {
            let aValue, bValue;

            if (sortField === 'numero_bl') {
                aValue = a.numero_bl || '';
                bValue = b.numero_bl || '';
            } else if (sortField === 'date_bl') {
                aValue = new Date(a.date_bl);
                bValue = new Date(b.date_bl);
            } else {
                return 0;
            }

            if (sortDirection === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    };

    const sortedBls = getSortedBls();

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-all duration-300 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {isEditing
                            ? `Modifier la Facture Client #${editingFactureId}`
                            : "Créer une nouvelle Facture Client"}
                    </h3>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Numéro Facture
                    </label>
                    <input
                        type="text"
                        value={data.numero_facture}
                        onChange={(e) => setData("numero_facture", e.target.value)}
                        placeholder="Numéro généré automatiquement"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Format: FC + mois + compteur + année (ex: FC09001-25). Pré-rempli automatiquement, modifiable si nécessaire.
                    </p>
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
                        Client <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                        options={clients.map(client => ({
                            value: client.id,
                            label: client.nom,
                            nom: client.nom,
                            email: client.email,
                            telephone: client.telephone
                        }))}
                        value={data.client_id}
                        onChange={(value) => {
                            const clientId = value;
                            setSelectedClient(clientId);
                            setData("client_id", clientId);

                            if (clientId) {
                                const filtered = blClients.filter(
                                    (bl) => String(bl.client_id) === String(clientId) &&
                                    (bl.facture_client_id === null ||
                                     (isEditing && bl.facture_client_id === editingFactureId))
                                );
                                setFilteredBlClients(filtered);
                            } else {
                                setFilteredBlClients([]);
                            }

                            setSelectedBLs([]);
                            setData("blClients", []);
                            setData("bls_to_remove", []);
                        }}
                        placeholder="Sélectionner un client"
                        searchPlaceholder="Rechercher un client..."
                        searchKeys={["nom", "email", "telephone"]}
                        error={errors.client_id}
                        required={true}
                        className="block w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            TVA (%)
                        </label>
                        <div className="block w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                            {TVA_RATE}% (fixe)
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Montant HT (DH)
                        </label>
                        <div className="block w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700">
                            {montantHt} DH
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Montant TTC (DH)
                        </label>
                        <div className="block w-full p-2 rounded-md bg-gray-100 dark:bg-gray-700 font-medium">
                            {montantTtc} DH
                        </div>
                    </div>
                </div>

                {selectedClient && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                BLs du Client
                            </h3>
                        </div>

                        {/* Associated BLs when editing */}
                        {isEditing && (
                            <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                    BLs actuellement associés à cette facture
                                </h4>
                                {filteredBlClients
                                    .filter(bl => bl.facture_client_id === editingFactureId)
                                    .length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        Aucun BL associé à cette facture
                                    </p>
                                ) : (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                        <div className="space-y-2">
                                            {filteredBlClients
                                                .filter(bl => bl.facture_client_id === editingFactureId)
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

                        {/* Available BLs */}
                        <div className="mb-4">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                {isEditing ? "BLs disponibles à ajouter" : "Sélectionnez les BLs"}
                            </h4>

                            {filteredBlClients.filter(bl =>
                                bl.facture_client_id === null
                            ).length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                    Aucun BL disponible pour ce client
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Sélection
                                                </th>
                                                <th
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    onClick={() => handleSort('numero_bl')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span>Numéro BL</span>
                                                        {sortField === 'numero_bl' && (
                                                            sortDirection === 'asc' ?
                                                                <ChevronUp className="h-4 w-4" /> :
                                                                <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    onClick={() => handleSort('date_bl')}
                                                >
                                                    <div className="flex items-center space-x-1">
                                                        <span>Date BL</span>
                                                        {sortField === 'date_bl' && (
                                                            sortDirection === 'asc' ?
                                                                <ChevronUp className="h-4 w-4" /> :
                                                                <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </div>
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
                                            {sortedBls.map((bl) => (
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
                                                    Total HT:
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    {montantHt} DH
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-right font-bold">
                                                    TVA ({TVA_RATE}%):
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    {tvaAmount} DH
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-right font-bold">
                                                    Total TTC:
                                                </td>
                                                <td className="px-6 py-4 font-bold">
                                                    {montantTtc} DH
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {errors.blClients && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {errors.blClients}
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
