import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";
import {
    PlusCircle,
    X,
    Trash2,
    Edit2,
    Plus,
    Eye,
    Check,
    CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";

export default function Index({
    facturesFournisseurs,
    fournisseurs,
    blFournisseurs,
    success,
    errors: pageErrors,
}) {
    console.log(blFournisseurs);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingFactureId, setEditingFactureId] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [selectedFournisseur, setSelectedFournisseur] = useState(null);
    const [filteredBlFournisseurs, setFilteredBlFournisseurs] = useState([]);
    const [selectedBLs, setSelectedBLs] = useState([]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        numero_facture: "",
        date_facture: new Date().toISOString().split("T")[0],
        fournisseur_id: "",
        blFournisseurs: [],
        montant_total: 0,
    });

    const toggleRowExpansion = (factureId) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(factureId)) {
                newSet.delete(factureId);
            } else {
                newSet.add(factureId);
            }
            return newSet;
        });
    };

    // On retire toute la logique d'appel API et on filtre localement
    const handleFournisseurChange = (e) => {
        const fournisseurId = e.target.value;
        setSelectedFournisseur(fournisseurId);
        setData("fournisseur_id", fournisseurId);

        if (fournisseurId) {
            // On filtre localement les BL du fournisseur sélectionné ET non associés à une facture
            const filtered = blFournisseurs.filter(
                (bl) => String(bl.fournisseur_id) === String(fournisseurId) && bl.facture_fournisseur_id === null
            );
            setFilteredBlFournisseurs(filtered);
        } else {
            setFilteredBlFournisseurs([]);
        }
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
                    (sum, detail) =>
                        sum + detail.quantite * detail.prix_unitaire,
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
                setShowForm(false);
                setIsEditing(false);
                setEditingFactureId(null);
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

    const handleEdit = (facture) => {
        setIsEditing(true);
        setEditingFactureId(facture.id);
        setData({
            numero_facture: facture.numero_facture,
            date_facture: facture.date_facture,
            fournisseur_id: facture.fournisseur_id,
            blFournisseurs: (facture.bonsLivraison || []).map((bl) => bl.id),
            montant_total: facture.montant_total,
        });
        setSelectedFournisseur(facture.fournisseur_id);
        setFilteredBlFournisseurs(facture.bonsLivraison || []);
        setSelectedBLs((facture.bonsLivraison || []).map((bl) => bl.id));
        setShowForm(true);
    };

    const openCreateForm = () => {
        setIsEditing(false);
        setEditingFactureId(null);
        setShowForm(true);
        reset();
        setSelectedFournisseur(null);
        setFilteredBlFournisseurs([]);
        setSelectedBLs([]);
    };

    return (
        <AuthenticatedLayout>
            <div className="py-6 px-4 sm:px-0">
                <div className="mx-auto max-w-full overflow-x-hidden">
                    {/* Messages de succès et d'erreur */}
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
                                        Numéro Facture{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.numero_facture}
                                        onChange={(e) =>
                                            setData(
                                                "numero_facture",
                                                e.target.value
                                            )
                                        }
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
                                        Date Facture{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_facture}
                                        onChange={(e) =>
                                            setData(
                                                "date_facture",
                                                e.target.value
                                            )
                                        }
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
                                        Fournisseur{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.fournisseur_id}
                                        onChange={handleFournisseurChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                        required
                                    >
                                        <option value="">
                                            Sélectionner un fournisseur
                                        </option>
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
                                                Aucun BL disponible pour ce
                                                fournisseur
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
                                                        {filteredBlFournisseurs.map(
                                                            (bl) => (
                                                                <tr
                                                                    key={bl.id}
                                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                                >
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedBLs.includes(
                                                                                bl.id
                                                                            )}
                                                                            onChange={() =>
                                                                                toggleBLSelection(
                                                                                    bl.id
                                                                                )
                                                                            }
                                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className="font-medium">
                                                                            {
                                                                                bl.numero_bl
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className="text-gray-600 dark:text-gray-300">
                                                                            {new Date(
                                                                                bl.date_bl
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className="font-medium">
                                                                            {bl.details
                                                                                .reduce(
                                                                                    (
                                                                                        sum,
                                                                                        detail
                                                                                    ) =>
                                                                                        sum +
                                                                                        detail.quantite *
                                                                                            detail.prix_unitaire,
                                                                                    0
                                                                                )
                                                                                .toFixed(
                                                                                    2
                                                                                )}{" "}
                                                                            DH
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                    <tfoot className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <td
                                                                colSpan="3"
                                                                className="px-6 py-4 text-right font-bold"
                                                            >
                                                                Total
                                                                sélectionné:
                                                            </td>
                                                            <td className="px-6 py-4 font-bold">
                                                                {calculateTotal()}{" "}
                                                                DH
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
                                        onClick={() => {
                                            setShowForm(false);
                                            setIsEditing(false);
                                            setEditingFactureId(null);
                                            reset();
                                            setSelectedFournisseur(null);
                                            setFilteredBlFournisseurs([]);
                                            setSelectedBLs([]);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={
                                            processing ||
                                            selectedBLs.length === 0
                                        }
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
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Numéro Facture
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date Facture
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Fournisseur
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Nb. BLs
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Montant Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {facturesFournisseurs?.data?.length > 0 ? (
                                        facturesFournisseurs.data.map(
                                            (item) => (
                                                <React.Fragment key={item.id}>
                                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="font-mono text-gray-500 dark:text-gray-400">
                                                                #{item.id}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="font-medium">
                                                                {
                                                                    item.numero_facture
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                {new Date(
                                                                    item.date_facture
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                {item
                                                                    .fournisseur
                                                                    ?.nom ||
                                                                    "N/A"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-gray-600 dark:text-gray-300">
                                                                {item.bonsLivraison?.length || 0}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="font-medium">
                                                                {item.montant_total?.toFixed(
                                                                    2
                                                                )}{" "}
                                                                DH
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() =>
                                                                        toggleRowExpansion(
                                                                            item.id
                                                                        )
                                                                    }
                                                                    className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    title={
                                                                        expandedRows.has(
                                                                            item.id
                                                                        )
                                                                            ? "Masquer les détails"
                                                                            : "Afficher les détails"
                                                                    }
                                                                >
                                                                    <Eye className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                    title="Modifier cette facture"
                                                                >
                                                                    <Edit2 className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedFacture(
                                                                            item
                                                                        );
                                                                        setShowDeleteModal(
                                                                            true
                                                                        );
                                                                    }}
                                                                    className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                    title="Supprimer cette facture"
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {expandedRows.has(
                                                        item.id
                                                    ) && (
                                                        <tr className="bg-gray-50 dark:bg-gray-700">
                                                            <td
                                                                colSpan="7"
                                                                className="px-6 py-4"
                                                            >
                                                                <div className="space-y-4">
                                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                                        Détails
                                                                        de la
                                                                        Facture
                                                                        #
                                                                        {
                                                                            item.id
                                                                        }
                                                                    </h4>

                                                                    {item.bonsLivraison?.length >
                                                                    0 ? (
                                                                        <div className="overflow-x-auto">
                                                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                                                <thead className="bg-gray-100 dark:bg-gray-600">
                                                                                    <tr>
                                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                            Numéro
                                                                                            BL
                                                                                        </th>
                                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                            Date
                                                                                            BL
                                                                                        </th>
                                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                            Articles
                                                                                        </th>
                                                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                            Montant
                                                                                            (DH)
                                                                                        </th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                                                    {item.bonsLivraison.map(
                                                                                        (
                                                                                            bl
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    bl.id
                                                                                                }
                                                                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                                                            >
                                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                                    <span className="font-medium">
                                                                                                        {
                                                                                                            bl.numero_bl
                                                                                                        }
                                                                                                    </span>
                                                                                                </td>
                                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                                    <span className="text-gray-600 dark:text-gray-300">
                                                                                                        {new Date(
                                                                                                            bl.date_bl
                                                                                                        ).toLocaleDateString()}
                                                                                                    </span>
                                                                                                </td>
                                                                                                <td className="px-6 py-4">
                                                                                                    <ul className="list-disc pl-5">
                                                                                                        {bl.details.map(
                                                                                                            (
                                                                                                                detail,
                                                                                                                idx
                                                                                                            ) => (
                                                                                                                <li
                                                                                                                    key={
                                                                                                                        idx
                                                                                                                    }
                                                                                                                    className="text-gray-600 dark:text-gray-300"
                                                                                                                >
                                                                                                                    {
                                                                                                                        detail
                                                                                                                            .article
                                                                                                                            ?.nom
                                                                                                                    }{" "}
                                                                                                                    (
                                                                                                                    {
                                                                                                                        detail.quantite
                                                                                                                    }{" "}
                                                                                                                    x{" "}
                                                                                                                    {
                                                                                                                        detail.prix_unitaire
                                                                                                                    }
                                                                                                                    DH)
                                                                                                                </li>
                                                                                                            )
                                                                                                        )}
                                                                                                    </ul>
                                                                                                </td>
                                                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                                                    <span className="font-medium">
                                                                                                        {bl.details
                                                                                                            .reduce(
                                                                                                                (
                                                                                                                    sum,
                                                                                                                    detail
                                                                                                                ) =>
                                                                                                                    sum +
                                                                                                                    detail.quantite *
                                                                                                                        detail.prix_unitaire,
                                                                                                                0
                                                                                                            )
                                                                                                            .toFixed(
                                                                                                                2
                                                                                                            )}{" "}
                                                                                                        DH
                                                                                                    </span>
                                                                                                </td>
                                                                                            </tr>
                                                                                        )
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                                                            Aucun
                                                                            BL
                                                                            associé
                                                                            à
                                                                            cette
                                                                            facture
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="text-center py-6 text-gray-500 dark:text-gray-400"
                                            >
                                                🚫 Aucune facture trouvée pour
                                                l'instant
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Confirmer la suppression
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    Êtes-vous sûr de vouloir supprimer la
                                    facture n°
                                    {selectedFacture?.numero_facture} ? Cette
                                    action est irréversible.
                                </p>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <Link
                                        href={route(
                                            "factures-fournisseurs.destroy",
                                            selectedFacture?.id
                                        )}
                                        method="delete"
                                        as="button"
                                        className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
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
        </AuthenticatedLayout>
    );
}
