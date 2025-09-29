import { useEffect, useState } from 'react';

export default function PaymentModal({
    selectedFacture,
    setSelectedFacture,
    editingId,
    setEditingId,
    form,
    modesPaiement,
    submitReglement
}) {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    // Use form data directly instead of local state
    const forcePaidStatus = form.data.force_paid_status || false;

    // Handle checkbox change with confirmation
    const handleForcePaidChange = (checked) => {
        if (checked) {
            setShowConfirmationModal(true);
        } else {
            form.setData('force_paid_status', false);
        }
    };

    // Handle confirmation modal
    const handleConfirmForcePaid = () => {
        form.setData('force_paid_status', true);
        setShowConfirmationModal(false);
    };

    const handleCancelForcePaid = () => {
        form.setData('force_paid_status', false);
        setShowConfirmationModal(false);
    };

    // Calculate remaining balance
    const calculateRemainingBalance = () => {
        const enteredAmount = parseFloat(form.data.montant_paye || 0);
        const totalAmount = editingId ? parseFloat(selectedFacture.montant_total) : parseFloat(selectedFacture.reste_a_payer);
        return totalAmount - enteredAmount;
    };

    // Get dynamic checkbox text based on amount
    const getCheckboxText = () => {
        const enteredAmount = parseFloat(form.data.montant_paye || 0);
        const totalAmount = editingId ? parseFloat(selectedFacture.montant_total) : parseFloat(selectedFacture.reste_a_payer);

        if (enteredAmount < totalAmount) {
            return "Marquer le règlement comme Payé même si le montant est inférieur au Montant à payer";
        } else if (enteredAmount > totalAmount) {
            return "Marquer le règlement comme Payé même si le montant est supérieur au Montant à payer";
        } else {
            return "Marquer le règlement comme Payé même si le montant est inférieur au Montant à payer";
        }
    };

    // Reset form data when the modal opens or payment type changes
    useEffect(() => {
        if (form.data.type_reglement === 'espèces') {
            form.setData({
                numero_cheque: '',
                banque_nom: '',
                iban_rib: '',
                reference_paiement: '',
            });
        }
    }, [form.data.type_reglement]);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 font-semibold flex items-center justify-between">
                    <span>{editingId ? 'Modifier le' : 'Nouveau'} règlement - {selectedFacture.numero_facture}</span>
                    <button
                        className="text-sm p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        onClick={() => {
                            setSelectedFacture(null);
                            setEditingId(null);
                            form.reset();
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    submitReglement();
                }} className="p-4 space-y-4">
                    {/* Hidden required fields */}
                    <input
                        type="hidden"
                        name="facture_id"
                        value={selectedFacture.id}
                    />
                    <input
                        type="hidden"
                        name="type"
                        value={selectedFacture.type}
                    />

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Montant de paiement</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={editingId ? selectedFacture.montant_total : selectedFacture.reste_a_payer}
                            className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={form.data.montant_paye || ''}
                            onChange={e => form.setData('montant_paye', e.target.value)}
                            required
                        />
                        <div className="mt-1 space-y-1">
                            <p className="text-xs text-gray-500">
                                {editingId
                                    ? `Montant total: ${parseFloat(selectedFacture.montant_total).toFixed(2)} DHS`
                                    : `Reste à payer: ${parseFloat(selectedFacture.reste_a_payer).toFixed(2)} DHS`
                                }
                            </p>
                            {form.data.montant_paye && calculateRemainingBalance() > 0 && (
                                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                    Reste à payer: {calculateRemainingBalance().toFixed(2)} MAD
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Type de règlement</label>
                        <select
                            className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={form.data.type_reglement || 'espèces'}
                            onChange={(e) => form.setData('type_reglement', e.target.value)}
                            required
                        >
                            {modesPaiement.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    {(form.data.type_reglement === 'chèque' || form.data.type_reglement === 'LCN') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    {form.data.type_reglement === 'LCN' ? 'N° LCN *' : 'N° Chèque *'}
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={form.data.numero_cheque || ''}
                                    onChange={e => form.setData('numero_cheque', e.target.value)}
                                    required={form.data.type_reglement === 'chèque' || form.data.type_reglement === 'LCN'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Banque *</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={form.data.banque_nom || ''}
                                    onChange={e => form.setData('banque_nom', e.target.value)}
                                    required={form.data.type_reglement === 'chèque' || form.data.type_reglement === 'LCN'}
                                />
                            </div>
                        </div>
                    )}

                    {form.data.type_reglement === 'virement' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Banque *</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={form.data.banque_nom || ''}
                                    onChange={e => form.setData('banque_nom', e.target.value)}
                                    required={form.data.type_reglement === 'virement'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">IBAN/RIB *</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={form.data.iban_rib || ''}
                                    onChange={e => form.setData('iban_rib', e.target.value)}
                                    required={form.data.type_reglement === 'virement'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Référence *</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={form.data.reference_paiement || ''}
                                    onChange={e => form.setData('reference_paiement', e.target.value)}
                                    required={form.data.type_reglement === 'virement'}
                                />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Créé le</label>
                            <input
                                type="date"
                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-600"
                                value={form.data.date_reglement || new Date().toISOString().slice(0, 10)}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date de paiement</label>
                            <input
                                type="date"
                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={form.data.date_paiement || ''}
                                onChange={e => form.setData('date_paiement', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">N° Règlement (optionnel)</label>
                        <input
                            type="text"
                            className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={form.data.numero_reglement || ''}
                            onChange={e => form.setData('numero_reglement', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description (optionnel)</label>
                        <textarea
                            rows={3}
                            className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={form.data.description || ''}
                            onChange={e => form.setData('description', e.target.value)}
                            placeholder="Ajouter une description ou des notes pour ce règlement..."
                        />
                    </div>

                    {/* Payment Status Override Checkbox */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={forcePaidStatus}
                                onChange={(e) => handleForcePaidChange(e.target.checked)}
                                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {getCheckboxText()}
                            </span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedFacture(null);
                                setEditingId(null);
                                form.reset();
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {form.processing ? 'Traitement...' : (editingId ? 'Modifier' : 'Enregistrer')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Confirmation Modal */}
            {showConfirmationModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Confirmation requise
                                    </h3>
                                </div>
                            </div>
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Vous êtes sur le point de marquer ce règlement comme 'Payée'. Êtes-vous sûr de vouloir continuer ?
                                </p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancelForcePaid}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmForcePaid}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
