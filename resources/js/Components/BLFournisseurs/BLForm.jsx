import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Input from "./Input";
import Select from "./Select";

export default function BLForm({
    fournisseurs,
    produits,
    isEditing,
    editingBl,
    onCancel,
}) {
    const TVA_RATE = 20; // Fixed TVA rate of 20%

    const { data, setData, post, put, processing, errors, reset } = useForm({
        numero_bl: "",
        date_bl: new Date().toISOString().split("T")[0],
        fournisseur_id: "",
        details: [],
    });

    // Initialize form with editing data if available
    useEffect(() => {
        if (isEditing && editingBl) {
            setData({
                numero_bl: editingBl.numero_bl,
                date_bl: editingBl.date_bl,
                fournisseur_id: editingBl.fournisseur_id,
                details: editingBl.details.map(detail => ({
                    produit_id: detail.produit_id,
                    quantite: detail.quantite,
                    prix_unitaire: detail.prix_unitaire,
                    montant_bl: detail.montant_bl || (detail.quantite * detail.prix_unitaire).toFixed(2),
                })),
            });
        }
    }, [isEditing, editingBl]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const submissionData = {
            ...data,
            details: data.details.map(detail => ({
                produit_id: detail.produit_id,
                quantite: parseFloat(detail.quantite),
                prix_unitaire: parseFloat(detail.prix_unitaire),
            })),
        };

        if (isEditing) {
            put(route("bl-fournisseurs.update", editingBl.id), {
                ...submissionData,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onCancel(); // Fermer le formulaire après modification réussie
                },
            });
        } else {
            post(route("bl-fournisseurs.store"), {
                ...submissionData,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onCancel(); // Fermer le formulaire après ajout réussi
                },
            });
        }
    };

    const addProduct = () => {
        setData('details', [
            ...data.details,
            {
                produit_id: "",
                quantite: 1,
                prix_unitaire: 0,
                montant_bl: 0,
            },
        ]);
    };

    const removeProduct = (index) => {
        const newDetails = [...data.details];
        newDetails.splice(index, 1);
        setData('details', newDetails);
    };

    const updateProduct = (index, field, value) => {
        const newDetails = [...data.details];

        if (field === "produit_id") {
            value = value && value !== "" ? String(value) : "";
            // Update price if product changes
            if (value) {
                const selectedProduit = produits.find(p => p.id == value);
                if (selectedProduit) {
                    newDetails[index].prix_unitaire = selectedProduit.prix_unitaire;
                }
            }
        }

        newDetails[index][field] = value;

        // Recalculate amount if quantity or price changes
        if (field === "quantite" || field === "prix_unitaire") {
            const quantite = parseFloat(newDetails[index].quantite) || 0;
            const prix = parseFloat(newDetails[index].prix_unitaire) || 0;
            newDetails[index].montant_bl = (quantite * prix).toFixed(2);
        }

        setData('details', newDetails);
    };

    // Calculate totals with TVA
    const calculateTotals = () => {
        const montantHt = data.details.reduce(
            (sum, detail) => sum + parseFloat(detail.montant_bl || 0),
            0
        );
        const tvaAmount = montantHt * (TVA_RATE / 100);
        const montantTtc = montantHt + tvaAmount;

        return {
            montantHt: montantHt.toFixed(2),
            tvaAmount: tvaAmount.toFixed(2),
            montantTtc: montantTtc.toFixed(2)
        };
    };

    const { montantHt, tvaAmount, montantTtc } = calculateTotals();

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

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-all duration-300 mb-6">
            <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {isEditing
                            ? `Modifier le BL Fournisseur #${editingBl?.id}`
                            : "Créer un nouveau BL Fournisseur"}
                    </h3>
                </div>

                {/* Basic Information Fields */}
                {basicFields.map((field) => (
                    <div key={field.name}>
                        <label
                            htmlFor={field.name}
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            {field.label}
                            {field.required && (
                                <span className="text-red-500">*</span>
                            )}
                        </label>
                        {field.type === "select" ? (
                            <Select
                                id={field.name}
                                name={field.name}
                                value={data[field.name]}
                                onChange={(e) => setData(field.name, e.target.value)}
                                options={field.options}
                                error={errors[field.name]}
                                required={field.required}
                            />
                        ) : (
                            <Input
                                type={field.type}
                                id={field.name}
                                name={field.name}
                                value={data[field.name]}
                                onChange={(e) => setData(field.name, e.target.value)}
                                error={errors[field.name]}
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
            </div>

            {/* Products Table */}
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

                {data.details.length === 0 ? (
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
                                {data.details.map((detail, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Select
                                                value={detail.produit_id || ""}
                                                onChange={(e) =>
                                                    updateProduct(
                                                        index,
                                                        "produit_id",
                                                        e.target.value
                                                    )
                                                }
                                                options={[
                                                    { value: "", label: "Sélectionner un produit" },
                                                    ...produits.map((p) => ({
                                                        value: p.id,
                                                        label: p.nom,
                                                    })),
                                                ]}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Input
                                                type="number"
                                                min="1"
                                                value={detail.quantite || 0}
                                                onChange={(e) =>
                                                    updateProduct(
                                                        index,
                                                        "quantite",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={detail.prix_unitaire || 0}
                                                onChange={(e) =>
                                                    updateProduct(
                                                        index,
                                                        "prix_unitaire",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {detail.montant_bl || 0} DH
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => removeProduct(index)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <td colSpan="3" className="px-6 py-4 text-right font-bold">
                                        Total HT:
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {montantHt} DH
                                    </td>
                                    <td></td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <td colSpan="3" className="px-6 py-4 text-right font-bold">
                                        TVA ({TVA_RATE}%):
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {tvaAmount} DH
                                    </td>
                                    <td></td>
                                </tr>
                                <tr className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-600">
                                    <td colSpan="3" className="px-6 py-4 text-right font-bold text-lg">
                                        Total TTC:
                                    </td>
                                    <td className="px-6 py-4 font-bold text-lg text-indigo-600 dark:text-indigo-400">
                                        {montantTtc} DH
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    Annuler
                </button>
                <button
                    type="submit"
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
    );
}
