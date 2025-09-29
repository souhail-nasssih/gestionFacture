import { useEffect } from 'react';

export default function PaymentModal({
    selectedFacture,
    setSelectedFacture,
    editingId,
    setEditingId,
    form,
    modesPaiement,
    submitReglement
}) {
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
                        <p className="text-xs text-gray-500 mt-1">
                            {editingId
                                ? `Montant total: ${parseFloat(selectedFacture.montant_total).toFixed(2)} DHS`
                                : `Reste à payer: ${parseFloat(selectedFacture.reste_a_payer).toFixed(2)} DHS`
                            }
                        </p>
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
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date de paiement *</label>
                            <input
                                type="date"
                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={form.data.date_reglement || new Date().toISOString().slice(0, 10)}
                                onChange={e => form.setData('date_reglement', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Heure</label>
                            <input
                                type="time"
                                className="w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={(form.data.date_reglement_at && form.data.date_reglement_at.split('T')[1]?.substring(0,5)) || ''}
                                onChange={e => {
                                    const time = e.target.value || '00:00';
                                    const date = form.data.date_reglement || new Date().toISOString().slice(0,10);
                                    form.setData('date_reglement_at', `${date}T${time}:00`);
                                }}
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
        </div>
    );
}
