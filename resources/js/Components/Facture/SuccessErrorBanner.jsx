// resources/js/Pages/FacturesFournisseurs/components/SuccessErrorBanner.jsx
export default function SuccessErrorBanner({ success, errors }) {
    return (
        <>
            {success && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{success}</span>
                </div>
            )}

            {errors?.general && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{errors.general}</span>
                </div>
            )}
        </>
    );
}
