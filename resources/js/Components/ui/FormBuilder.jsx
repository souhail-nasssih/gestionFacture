import { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import {
    CheckCircle,
    AlertCircle,
    ChevronDown,
    X,
    Loader2,
} from "lucide-react";

const FormBuilder = ({
    fields,
    initialData = {},
    onSubmit,
    submitText = "Enregistrer",
    resetText = "Annuler",
    className = "",
    onSuccess,
    clientSideValidation = true, // Nouvelle prop pour activer/désactiver la validation côté client
    beforeSubmit, // Nouvelle prop pour validation personnalisée avant soumission
    additionalData = {}, // Données supplémentaires à envoyer avec la requête
}) => {
    initialData = initialData || {};
    const { errors } = usePage().props;
    const [processing, setProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [clientErrors, setClientErrors] = useState({}); // Erreurs de validation côté client
    const [touchedFields, setTouchedFields] = useState({}); // Champs modifiés par l'utilisateur

    const { data, setData, post, put, reset } = useForm(initialData);



    // Validation côté client
    const validateField = (fieldName, value) => {
        const field = fields.find(f => f.name === fieldName);
        if (!field) return null;

        const errors = {};

        // Validation requise
        if (field.required && !value) {
            errors[fieldName] = "Ce champ est obligatoire";
            return errors[fieldName];
        }

        // Validation spécifique par type de champ
        switch (field.type) {
            case "email":
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors[fieldName] = "Veuillez entrer une adresse email valide";
                }
                break;
            case "tel":
                if (value && !/^[+\-\s\d]{10,15}$/.test(value)) {
                    errors[fieldName] = "Veuillez entrer un numéro de téléphone valide";
                }
                break;
            case "number":
                if (value && isNaN(value)) {
                    errors[fieldName] = "Veuillez entrer un nombre valide";
                }
                if (field.min && +value < field.min) {
                    errors[fieldName] = `La valeur doit être au moins ${field.min}`;
                }
                if (field.max && +value > field.max) {
                    errors[fieldName] = `La valeur ne doit pas dépasser ${field.max}`;
                }
                break;
            case "text":
                if (field.minLength && value.length < field.minLength) {
                    errors[fieldName] = `Doit contenir au moins ${field.minLength} caractères`;
                }
                if (field.maxLength && value.length > field.maxLength) {
                    errors[fieldName] = `Ne doit pas dépasser ${field.maxLength} caractères`;
                }
                break;
            default:
                break;
        }

        return errors[fieldName];
    };

    // Marquer un champ comme "touché" (modifié par l'utilisateur)
    const handleBlur = (fieldName) => {
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));

        if (clientSideValidation) {
            const error = validateField(fieldName, data[fieldName]);
            setClientErrors(prev => ({
                ...prev,
                [fieldName]: error || null
            }));
        }
    };

    // Validation avant soumission
    const validateForm = () => {
        if (!clientSideValidation) return true;

        const newErrors = {};
        let isValid = true;

        fields.forEach(field => {
            const error = validateField(field.name, data[field.name]);
            if (error) {
                newErrors[field.name] = error;
                isValid = false;
            }
        });

        setClientErrors(newErrors);
        return isValid;
    };

    useEffect(() => {
        if (Object.keys(errors).length === 0 && showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [errors, showSuccess]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation côté client
        if (clientSideValidation && !validateForm()) {
            return;
        }

        // Validation personnalisée avant soumission
        if (beforeSubmit && !beforeSubmit()) {
            return;
        }

        setProcessing(true);

        const method = initialData.id ? put : post;

        // Créer un objet avec toutes les données à envoyer
        const allData = { ...data, ...additionalData };

        console.log('Données envoyées:', allData);

        method(onSubmit, allData, {
            onSuccess: () => {
                setShowSuccess(true);
                if (!initialData.id) reset();
                onSuccess?.();
                setClientErrors({});
            },
            onError: (errors) => {
                // Traitement des erreurs spécifiques du serveur
                const processedErrors = {};
                Object.keys(errors).forEach(key => {
                    if (errors[key].includes("has already been taken")) {
                        processedErrors[key] = `Ce ${key} est déjà utilisé`;
                    } else if (errors[key].includes("invalid format")) {
                        processedErrors[key] = `Format de ${key} invalide`;
                    } else {
                        processedErrors[key] = errors[key];
                    }
                });
                // Mettre à jour les erreurs pour affichage
                setClientErrors(processedErrors);
            },
            onFinish: () => setProcessing(false),
        });
    };

    const renderField = (field) => {
        const error = clientErrors[field.name] || errors[field.name];
        const isTouched = touchedFields[field.name];

        // Ne montrer l'erreur que si le champ a été touché ou s'il y a une erreur serveur
        const showError = (isTouched || errors[field.name]) && error;

        const commonProps = {
            id: field.name,
            name: field.name,
            value: data[field.name] ?? "",
            onChange: (e) => {
                setData(field.name, e.target.value);
                if (clientSideValidation && isTouched) {
                    const error = validateField(field.name, e.target.value);
                    setClientErrors(prev => ({
                        ...prev,
                        [field.name]: error || null
                    }));
                }
            },
            onBlur: () => handleBlur(field.name),
            className: `block w-full rounded-lg border ${
                showError
                    ? "border-red-400 text-red-800 placeholder-red-400 focus:ring-red-400 focus:border-red-400"
                    : "border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            } shadow-sm transition duration-200 ${
                field.type === "textarea" ? "min-h-[120px]" : "h-10"
            } bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-2 ${
                processing ? "opacity-70 cursor-not-allowed" : ""
            }`,
            disabled: processing,
            placeholder: field.placeholder || "",
        };

        switch (field.type) {
            case "select":
                return (
                    <div className="relative">
                        <select {...commonProps}>
                            <option value="" disabled>
                                {field.placeholder || "Sélectionnez une option"}
                            </option>
                            {field.options?.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                >
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                );
            case "textarea":
                return <textarea {...commonProps} rows={field.rows || 4} />;
            case "checkbox":
                return (
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                type="checkbox"
                                id={field.name}
                                checked={!!data[field.name]}
                                onChange={(e) =>
                                    setData(field.name, e.target.checked)
                                }
                                onBlur={() => handleBlur(field.name)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-700"
                                disabled={processing}
                            />
                        </div>
                        {field.label && (
                            <label
                                htmlFor={field.name}
                                className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                {field.label}
                            </label>
                        )}
                    </div>
                );
            case "file":
                return (
                    <div className="space-y-2">
                        <input
                            type="file"
                            id={field.name}
                            name={field.name}
                            onChange={(e) =>
                                setData(field.name, e.target.files[0])
                            }
                            onBlur={() => handleBlur(field.name)}
                            className="block w-full text-sm text-gray-600 dark:text-gray-300
                                file:mr-4 file:py-2.5 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-medium
                                file:bg-indigo-50 file:text-indigo-600
                                hover:file:bg-indigo-100
                                dark:file:bg-gray-600 dark:file:text-gray-100
                                transition duration-200"
                            disabled={processing}
                        />
                        {data[field.name]?.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Fichier sélectionné : {data[field.name].name}
                            </p>
                        )}
                    </div>
                );
            default:
                return <input type={field.type || "text"} {...commonProps} />;
        }
    };

    useEffect(() => {
        setData(initialData || {});
    }, [initialData]);

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 ${className}`}
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {showSuccess && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 p-4 mb-6">
                        <div className="flex items-center">
                            <CheckCircle className="flex-shrink-0 h-5 w-5 text-green-500 dark:text-green-400" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Données enregistrées avec succès !
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSuccess(false)}
                                className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fields.map((field) => {
                        const error = clientErrors[field.name] || errors[field.name];
                        const isTouched = touchedFields[field.name];
                        const showError = (isTouched || errors[field.name]) && error;

                        return (
                            <div
                                key={field.name}
                                className={`space-y-2 ${
                                    field.fullWidth ? "md:col-span-2" : ""
                                }`}
                            >
                                <label
                                    htmlFor={field.name}
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    {field.label}
                                    {field.required && (
                                        <span className="text-red-500 ml-1">*</span>
                                    )}
                                </label>

                                {field.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {field.description}
                                    </p>
                                )}

                                {renderField(field)}

                                {showError && (
                                    <div className="flex items-start mt-1 text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="flex-shrink-0 h-4 w-4 mt-0.5 mr-1" />
                                        <p>{error}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            reset();
                            setClientErrors({});
                            setTouchedFields({});
                        }}
                        disabled={processing}
                        className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resetText}
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                En cours...
                            </>
                        ) : (
                            submitText
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormBuilder;
