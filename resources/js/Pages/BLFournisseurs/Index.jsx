import DataTable from "@/Components/ui/DataTable";
import FormBuilder from "@/Components/ui/FormBuilder";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";
import { PlusCircle, X, Trash2, Edit2, Plus, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import React from "react";

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
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [formValues, setFormValues] = useState({
        fournisseur_id: "",
        date_bl: new Date().toISOString().split("T")[0],
        numero_bl: "",
        details: [],
    });
    const [formData, setFormData] = useState({
        fournisseur_id: "",
        date_bl: new Date().toISOString().split("T")[0],
        numero_bl: "",
    });

    const { data, setData, post, put, processing, errors, reset } = useForm({
        numero_bl: "",
        date_bl: new Date().toISOString().split("T")[0],
        fournisseur_id: "",
        details: [],
    });

    // Synchroniser les données d'Inertia avec formData
    useEffect(() => {
        setData({
            numero_bl: formData.numero_bl || "",
            date_bl: formData.date_bl || "",
            fournisseur_id: formData.fournisseur_id || "",
            details: formValues.details,
        });
    }, [formData, formValues.details]);

    const handleSubmit = () => {
        const submissionData = {
            numero_bl: formData.numero_bl,
            date_bl: formData.date_bl,
            fournisseur_id: formData.fournisseur_id,
            details: formValues.details.map((detail) => ({
                produit_id: detail.produit_id,
                quantite: parseFloat(detail.quantite),
                prix_unitaire: parseFloat(detail.prix_unitaire),
            })),
        };

        const clientErrors = validateForm(submissionData);
        if (clientErrors.length > 0) {
            alert("Erreurs de validation:\n" + clientErrors.join("\n"));
            return;
        }

        // Log de débogage pour identifier le problème
        console.log("=== DÉBUG FRONTEND ===", {
            isEditing,
            editingBlId,
            url: isEditing
                ? route("bl-fournisseurs.update", editingBlId)
                : route("bl-fournisseurs.store"),
            submissionData,
        });

        const url = isEditing
            ? route("bl-fournisseurs.update", editingBlId)
            : route("bl-fournisseurs.store");

        const requestOptions = {
            onSuccess: () => {
                setShowForm(false); // ← fermeture du formulaire
                setIsEditing(false);
                setEditingBlId(null);
                reset();
                setFormValues({
                    fournisseur_id: "",
                    date_bl: new Date().toISOString().split("T")[0],
                    numero_bl: "",
                    details: [],
                });
                setFormData({
                    fournisseur_id: "",
                    date_bl: new Date().toISOString().split("T")[0],
                    numero_bl: "",
                });
            },
            onError: (errors) => {
                let errorMessage = "Erreurs de validation :\n";

                if (errors.fournisseur_id) {
                    if (errors.fournisseur_id.includes("required")) {
                        errorMessage += "- Le fournisseur est obligatoire\n";
                    } else if (errors.fournisseur_id.includes("exists")) {
                        errorMessage +=
                            "- Le fournisseur sélectionné n'existe pas\n";
                    } else {
                        errorMessage += `- Fournisseur: ${errors.fournisseur_id}\n`;
                    }
                }

                if (errors.date_bl) {
                    if (errors.date_bl.includes("required")) {
                        errorMessage += "- La date BL est obligatoire\n";
                    } else if (errors.date_bl.includes("date")) {
                        errorMessage +=
                            "- La date BL doit être une date valide\n";
                    } else {
                        errorMessage += `- Date BL: ${errors.date_bl}\n`;
                    }
                }

                if (errors.details) {
                    errorMessage += "- Erreurs dans les produits :\n";
                    if (Array.isArray(errors.details)) {
                        errors.details.forEach((error, index) => {
                            errorMessage += `  Produit #${
                                index + 1
                            }: ${error}\n`;
                        });
                    } else {
                        errorMessage += Object.values(errors.details).join(
                            "\n"
                        );
                    }
                }

                // Gestion des erreurs générales (validation personnalisée côté serveur)
                if (errors.general) {
                    errorMessage += `- ${errors.general}\n`;
                }

                // Gestion des erreurs de validation personnalisées
                if (errors.numero_bl) {
                    if (errors.numero_bl.includes("existe déjà")) {
                        errorMessage += `- ${errors.numero_bl}\n`;
                    } else if (
                        errors.numero_bl.includes("already been taken")
                    ) {
                        errorMessage += "- Ce numéro de BL existe déjà\n";
                    } else if (errors.numero_bl.includes("required")) {
                        errorMessage += "- Le numéro BL est obligatoire\n";
                    } else if (errors.numero_bl.includes("string")) {
                        errorMessage +=
                            "- Le numéro BL doit être une chaîne de caractères\n";
                    } else {
                        errorMessage += `- Numéro BL: ${errors.numero_bl}\n`;
                    }
                }

                if (errorMessage === "Erreurs de validation :\n") {
                    errorMessage = "Une erreur inconnue est survenue";
                }

                alert(errorMessage);
            },
            preserveScroll: true,
        };

        if (isEditing) {
            put(url, submissionData, requestOptions);
        } else {
            post(url, submissionData, requestOptions);
        }
    };

    // Fonction de validation séparée
    const validateForm = (data) => {
        const errors = [];
        if (!data.numero_bl?.trim())
            errors.push("Le numéro BL est obligatoire");
        if (!data.date_bl?.trim()) errors.push("La date BL est obligatoire");
        if (!data.fournisseur_id) errors.push("Le fournisseur est obligatoire");
        if (data.details.length === 0) {
            errors.push("Veuillez ajouter au moins un produit");
        } else {
            const produitIds = [];
            data.details.forEach((detail, index) => {
                if (!detail.produit_id) {
                    errors.push(`Produit #${index + 1}: sélection obligatoire`);
                } else if (produitIds.includes(detail.produit_id)) {
                    errors.push(`Produit #${index + 1}: doublon détecté`);
                } else {
                    produitIds.push(detail.produit_id);
                }
                if (!detail.quantite || detail.quantite <= 0) {
                    errors.push(`Produit #${index + 1}: quantité invalide`);
                }
                if (!detail.prix_unitaire || detail.prix_unitaire <= 0) {
                    errors.push(
                        `Produit #${index + 1}: prix unitaire invalide`
                    );
                }
            });
        }
        return errors;
    };

    const addProduct = () => {
        setFormValues((prev) => ({
            ...prev,
            details: [
                ...prev.details,
                {
                    produit_id: "",
                    quantite: 1,
                    prix_unitaire: 0,
                    montantBL: 0,
                },
            ],
        }));
    };

    const addMultipleProducts = (count = 1) => {
        setFormValues((prev) => ({
            ...prev,
            details: [
                ...prev.details,
                ...Array(count)
                    .fill()
                    .map(() => ({
                        produit_id: "",
                        quantite: 1,
                        prix_unitaire: 0,
                        montantBL: 0,
                    })),
            ],
        }));
    };

    const removeProduct = (index) => {
        setFormValues((prev) => {
            const newDetails = [...prev.details];
            newDetails.splice(index, 1);
            return { ...prev, details: newDetails };
        });
    };

    const handleEdit = (blFournisseur) => {
        console.log("=== DÉBUG HANDLE EDIT ===", {
            blFournisseur,
            id: blFournisseur.id,
            numero_bl: blFournisseur.numero_bl,
        });

        setIsEditing(true);
        setEditingBlId(blFournisseur.id);
        setFormData({
            fournisseur_id: blFournisseur.fournisseur_id,
            date_bl: blFournisseur.date_bl,
            numero_bl: blFournisseur.numero_bl,
        });
        setFormValues({
            fournisseur_id: blFournisseur.fournisseur_id,
            date_bl: blFournisseur.date_bl,
            numero_bl: blFournisseur.numero_bl,
            details: blFournisseur.details.map((detail) => ({
                produit_id: detail.produit_id,
                quantite: detail.quantite,
                prix_unitaire: detail.prix_unitaire,
                montantBL: detail.montantBL,
            })),
        });
        setShowForm(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingBlId(null);
        setShowForm(false);
        reset();
        setFormValues({
            fournisseur_id: "",
            date_bl: new Date().toISOString().split("T")[0],
            numero_bl: "",
            details: [],
        });
        setFormData({
            fournisseur_id: "",
            date_bl: new Date().toISOString().split("T")[0],
            numero_bl: "",
        });
    };

    const openCreateForm = () => {
        setIsEditing(false);
        setEditingBlId(null);
        setShowForm(true);
        reset();
        setFormValues({
            fournisseur_id: "",
            date_bl: new Date().toISOString().split("T")[0],
            numero_bl: "",
            details: [],
        });
        setFormData({
            fournisseur_id: "",
            date_bl: new Date().toISOString().split("T")[0],
            numero_bl: "",
        });
    };

    const updateProduct = (index, field, value) => {
        setFormValues((prev) => {
            const newDetails = [...prev.details];

            if (field === "produit_id") {
                value = value && value !== "" ? String(value) : "";
            }

            newDetails[index][field] = value;

            if (
                field === "quantite" ||
                field === "prix_unitaire" ||
                field === "produit_id"
            ) {
                const quantite = parseFloat(newDetails[index].quantite) || 0;
                let prix = parseFloat(newDetails[index].prix_unitaire) || 0;

                if (field === "produit_id" && value && value !== "") {
                    const selectedProduit = produits.find((p) => p.id == value);
                    if (selectedProduit) {
                        prix = selectedProduit.prix_unitaire;
                        newDetails[index].prix_unitaire = prix;
                    }
                }

                newDetails[index].montantBL = (quantite * prix).toFixed(2);
            }

            return { ...prev, details: newDetails };
        });
    };

    const toggleRowExpansion = (blId) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(blId)) {
                newSet.delete(blId);
            } else {
                newSet.add(blId);
            }
            return newSet;
        });
    };

    const basicFields = [
        {
            name: "numero_bl",
            label: "Numéro BL",
            type: "text",
            required: true,
        },
        {
            name: "date_bl",
            label: "Date BL",
            type: "date",
            required: true,
        },
        {
            name: "fournisseur_id",
            label: "Fournisseur",
            type: "select",
            required: true,
            options: [
                { value: "", label: "Sélectionner un fournisseur" },
                ...fournisseurs.map((f) => ({ value: f.id, label: f.nom })),
            ],
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
            key: "numero_bl",
            title: "Numéro BL",
            render: (item) => (
                <span className="font-medium">{item.numero_bl}</span>
            ),
        },
        {
            key: "date_bl",
            title: "Date BL",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {new Date(item.date_bl).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "fournisseur",
            title: "Fournisseur",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {item.fournisseur?.nom || "N/A"}
                </span>
            ),
        },
        {
            key: "details_count",
            title: "Nb. Articles",
            render: (item) => (
                <span className="text-gray-600 dark:text-gray-300">
                    {item.details?.length || 0}
                </span>
            ),
        },
        {
            key: "total_amount",
            title: "Montant Total",
            render: (item) => (
                <span className="font-medium">
                    {item.details
                        ?.reduce(
                            (sum, detail) =>
                                sum + detail.quantite * detail.prix_unitaire,
                            0
                        )
                        .toFixed(2)}{" "}
                    DH
                </span>
            ),
        },
        {
            key: "actions",
            title: "Actions",
            render: (item) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => toggleRowExpansion(item.id)}
                        className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title={
                            expandedRows.has(item.id)
                                ? "Masquer les détails"
                                : "Afficher les détails"
                        }
                    >
                        <Eye className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedBlFournisseur(item);
                            setShowDeleteModal(true);
                        }}
                        className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            ),
        },
    ];

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
                                Gestion des BL Fournisseurs
                            </h2>
                            <button
                                onClick={() => {
                                    if (showForm) {
                                        if (isEditing) {
                                            handleCancelEdit();
                                        } else {
                                            setShowForm(false);
                                            reset();
                                            setFormValues({
                                                fournisseur_id: "",
                                                date_bl: new Date()
                                                    .toISOString()
                                                    .split("T")[0],
                                                numero_bl: "",
                                                details: [],
                                            });
                                            setFormData({
                                                fournisseur_id: "",
                                                date_bl: new Date()
                                                    .toISOString()
                                                    .split("T")[0],
                                                numero_bl: "",
                                            });
                                        }
                                    } else {
                                        openCreateForm();
                                    }
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

                    {showForm && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-all duration-300 mb-6">
                            <div className="space-y-4">
                                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {isEditing
                                            ? `Modifier le BL Fournisseur #${editingBlId}`
                                            : "Créer un nouveau BL Fournisseur"}
                                    </h3>
                                </div>
                                {basicFields.map((field) => (
                                    <div key={field.name}>
                                        <label
                                            htmlFor={field.name}
                                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                        >
                                            {field.label}
                                            {field.required && (
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                        {field.type === "select" ? (
                                            <select
                                                id={field.name}
                                                name={field.name}
                                                value={data[field.name] || ""}
                                                onChange={(e) => {
                                                    setData(
                                                        field.name,
                                                        e.target.value
                                                    );
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        [field.name]:
                                                            e.target.value,
                                                    }));
                                                    setFormValues((prev) => ({
                                                        ...prev,
                                                        [field.name]:
                                                            e.target.value,
                                                    }));
                                                }}
                                                className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white ${
                                                    errors[field.name]
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                }`}
                                                required={field.required}
                                            >
                                                {field.options?.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                id={field.name}
                                                name={field.name}
                                                value={data[field.name] || ""}
                                                onChange={(e) => {
                                                    setData(
                                                        field.name,
                                                        e.target.value
                                                    );
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        [field.name]:
                                                            e.target.value,
                                                    }));
                                                    setFormValues((prev) => ({
                                                        ...prev,
                                                        [field.name]:
                                                            e.target.value,
                                                    }));
                                                }}
                                                className={`block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white ${
                                                    errors[field.name]
                                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 dark:border-gray-600"
                                                }`}
                                                required={field.required}
                                            />
                                        )}
                                        {errors[field.name] && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {errors[field.name]}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({
                                                fournisseur_id: "",
                                                date_bl: new Date()
                                                    .toISOString()
                                                    .split("T")[0],
                                                numero_bl: "",
                                            });
                                            setFormValues((prev) => ({
                                                ...prev,
                                                fournisseur_id: "",
                                                date_bl: new Date()
                                                    .toISOString()
                                                    .split("T")[0],
                                                numero_bl: "",
                                            }));
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Réinitialiser
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={processing}
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

                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Produits
                                    </h3>
                                    <button
                                        onClick={addProduct}
                                        className="inline-flex items-center px-3 py-1 bg-green-600 border border-transparent rounded-md text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Ajouter un produit
                                    </button>
                                </div>

                                {formValues.details.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        Aucun produit ajouté
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Produit
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Quantité
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Prix unitaire (DH)
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Montant (DH)
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {formValues.details.map(
                                                    (detail, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <select
                                                                    value={
                                                                        detail.produit_id ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateProduct(
                                                                            index,
                                                                            "produit_id",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                                >
                                                                    <option value="">
                                                                        Sélectionner
                                                                        un
                                                                        produit
                                                                    </option>
                                                                    {produits.map(
                                                                        (
                                                                            produit
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    produit.id
                                                                                }
                                                                                value={
                                                                                    produit.id
                                                                                }
                                                                            >
                                                                                {
                                                                                    produit.nom
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </select>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={
                                                                        detail.quantite ||
                                                                        0
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateProduct(
                                                                            index,
                                                                            "quantite",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={
                                                                        detail.prix_unitaire ||
                                                                        0
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateProduct(
                                                                            index,
                                                                            "prix_unitaire",
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {detail.montantBL ||
                                                                    0}{" "}
                                                                DH
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <button
                                                                    onClick={() =>
                                                                        removeProduct(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50 dark:bg-gray-700">
                                                    <td
                                                        colSpan="3"
                                                        className="px-6 py-4 text-right font-bold"
                                                    >
                                                        Total:
                                                    </td>
                                                    <td className="px-6 py-4 font-bold">
                                                        {formValues.details
                                                            .reduce(
                                                                (sum, detail) =>
                                                                    sum +
                                                                    parseFloat(
                                                                        detail.montantBL ||
                                                                            0
                                                                    ),
                                                                0
                                                            )
                                                            .toFixed(2)}{" "}
                                                        DH
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
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
                                            Numéro BL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Date BL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Fournisseur
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Nb. Articles
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
                                    {blFournisseurs.data.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-gray-500 dark:text-gray-400">
                                                        #{item.id}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium">
                                                        {item.numero_bl}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        {new Date(
                                                            item.date_bl
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        {item.fournisseur
                                                            ?.nom || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        {item.details?.length ||
                                                            0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-medium">
                                                        {item.details
                                                            ?.reduce(
                                                                (sum, detail) =>
                                                                    sum +
                                                                    detail.quantite *
                                                                        detail.prix_unitaire,
                                                                0
                                                            )
                                                            .toFixed(2)}{" "}
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
                                                                handleEdit(item)
                                                            }
                                                            className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                            title="Modifier ce BL Fournisseur"
                                                        >
                                                            <Edit2 className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedBlFournisseur(
                                                                    item
                                                                );
                                                                setShowDeleteModal(
                                                                    true
                                                                );
                                                            }}
                                                            className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Supprimer ce BL Fournisseur"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRows.has(item.id) && (
                                                <tr className="bg-gray-50 dark:bg-gray-700">
                                                    <td
                                                        colSpan="7"
                                                        className="px-6 py-4"
                                                    >
                                                        <div className="space-y-4">
                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                Détails du BL
                                                                Fournisseur #
                                                                {item.id}
                                                            </h4>
                                                            {item.details &&
                                                            item.details
                                                                .length > 0 ? (
                                                                <div className="overflow-x-auto">
                                                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                                                        <thead className="bg-gray-100 dark:bg-gray-600">
                                                                            <tr>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                    Produit
                                                                                </th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                    Quantité
                                                                                </th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                    Prix
                                                                                    unitaire
                                                                                </th>
                                                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                                    Montant
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                                                            {item.details.map(
                                                                                (
                                                                                    detail,
                                                                                    index
                                                                                ) => (
                                                                                    <tr
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                                            {detail
                                                                                                .produit
                                                                                                ?.nom ||
                                                                                                `Produit ID: ${detail.produit}`}
                                                                                        </td>
                                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                                            {
                                                                                                detail.quantite
                                                                                            }
                                                                                        </td>
                                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                                            {
                                                                                                detail.prix_unitaire
                                                                                            }{" "}
                                                                                            DH
                                                                                        </td>
                                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                                            {detail.montantBL ||
                                                                                                (
                                                                                                    detail.quantite *
                                                                                                    detail.prix_unitaire
                                                                                                ).toFixed(
                                                                                                    2
                                                                                                )}{" "}
                                                                                            DH
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            )}
                                                                        </tbody>
                                                                        <tfoot className="bg-gray-100 dark:bg-gray-600">
                                                                            <tr>
                                                                                <td
                                                                                    colSpan="3"
                                                                                    className="px-4 py-2 text-right font-bold text-sm text-gray-900 dark:text-gray-100"
                                                                                >
                                                                                    Total:
                                                                                </td>
                                                                                <td className="px-4 py-2 whitespace-nowrap font-bold text-sm text-gray-900 dark:text-gray-100">
                                                                                    {item.details
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
                                                                                </td>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                                                    Aucun détail
                                                                    disponible
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
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
                                    Êtes-vous sûr de vouloir supprimer le BL
                                    Fournisseur n°
                                    {selectedBlFournisseur?.numero_bl} ? Cette
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
                                            "bl-fournisseurs.destroy",
                                            selectedBlFournisseur?.id
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
