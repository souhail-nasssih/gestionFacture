import React from "react";
import FormBuilder from "@/Components/ui/FormBuilder";
import { clientFields } from "./constants.jsx";

export default function ClientForm({
    showForm,
    formValues,
    onSubmit,
    onSuccess,
    onCancel
}) {
    if (!showForm) return null;

    return (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 transition-all duration-300">
            <FormBuilder
                fields={clientFields}
                initialData={formValues || {}}
                onSubmit={onSubmit}
                submitText={formValues?.id ? "Mettre à jour" : "Créer"}
                resetText="Réinitialiser"
                onSuccess={onSuccess}
                onCancel={onCancel}
            />
        </div>
    );
}
