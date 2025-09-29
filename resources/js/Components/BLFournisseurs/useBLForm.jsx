
import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function useBLForm({ fournisseurs, produits, isEditing, editingBl }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        numero_bl: '',
        date_bl: new Date().toISOString().split('T')[0],
        fournisseur_id: '',
        details: [],
    });

    // Initialize form with editing data if available
    useEffect(() => {
        if (isEditing && editingBl) {
            // Format date properly for HTML date input (YYYY-MM-DD)
            let formattedDate = new Date().toISOString().split('T')[0]; // Default to today
            if (editingBl.date_bl) {
                // Handle different date formats that might come from the backend
                if (typeof editingBl.date_bl === 'string') {
                    // If it's already a string, try to extract YYYY-MM-DD format
                    formattedDate = editingBl.date_bl.includes('T')
                        ? editingBl.date_bl.split('T')[0]
                        : editingBl.date_bl;
                } else if (editingBl.date_bl instanceof Date) {
                    // If it's a Date object
                    formattedDate = editingBl.date_bl.toISOString().split('T')[0];
                }
            }

            setData({
                numero_bl: editingBl.numero_bl,
                date_bl: formattedDate,
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

    const validateForm = () => {
        const validationErrors = [];

        if (!data.numero_bl?.trim()) {
            validationErrors.push('Le numéro BL est obligatoire');
        }

        if (!data.date_bl?.trim()) {
            validationErrors.push('La date BL est obligatoire');
        }

        if (!data.fournisseur_id) {
            validationErrors.push('Le fournisseur est obligatoire');
        }

        if (data.details.length === 0) {
            validationErrors.push('Veuillez ajouter au moins un produit');
        } else {
            const produitIds = new Set();
            data.details.forEach((detail, index) => {
                if (!detail.produit_id) {
                    validationErrors.push(`Produit #${index + 1}: sélection obligatoire`);
                } else if (produitIds.has(detail.produit_id)) {
                    validationErrors.push(`Produit #${index + 1}: doublon détecté`);
                } else {
                    produitIds.add(detail.produit_id);
                }

                if (!detail.quantite || detail.quantite <= 0) {
                    validationErrors.push(`Produit #${index + 1}: quantité invalide`);
                }

                if (!detail.prix_unitaire || detail.prix_unitaire <= 0) {
                    validationErrors.push(`Produit #${index + 1}: prix unitaire invalide`);
                }
            });
        }

        return validationErrors;
    };

    const handleSubmit = (onSuccess) => {
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            return { success: false, errors: validationErrors };
        }

        const submissionData = {
            ...data,
            details: data.details.map(detail => ({
                produit_id: detail.produit_id,
                quantite: parseFloat(detail.quantite),
                prix_unitaire: parseFloat(detail.prix_unitaire),
            })),
        };

        if (isEditing) {
            put(route('bl-fournisseurs.update', editingBl.id), {
                data: submissionData,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    if (onSuccess) onSuccess();
                },
            });
        } else {
            post(route('bl-fournisseurs.store'), {
                data: submissionData,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    if (onSuccess) onSuccess();
                },
            });
        }

        return { success: true };
    };

    const addProduct = () => {
        setData('details', [
            ...data.details,
            {
                produit_id: '',
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

        if (field === 'produit_id') {
            value = value && value !== '' ? String(value) : '';
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
        if (field === 'quantite' || field === 'prix_unitaire') {
            const quantite = parseFloat(newDetails[index].quantite) || 0;
            const prix = parseFloat(newDetails[index].prix_unitaire) || 0;
            newDetails[index].montant_bl = (quantite * prix).toFixed(2);
        }

        setData('details', newDetails);
    };

    const resetForm = () => {
        reset();
        setData({
            numero_bl: '',
            date_bl: new Date().toISOString().split('T')[0],
            fournisseur_id: '',
            details: [],
        });
    };

    return {
        data,
        setData,
        errors,
        processing,
        handleSubmit,
        addProduct,
        removeProduct,
        updateProduct,
        resetForm,
        validateForm,
    };
}
