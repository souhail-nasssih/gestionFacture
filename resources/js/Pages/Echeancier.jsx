import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Echeancier() {
    const [reglements, setReglements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/reglements')
            .then(res => res.json())
            .then(data => {
                setReglements(data.data || []);
                setLoading(false);
            });
    }, []);

    return (
        <AuthenticatedLayout>
            <div className="py-6 px-4 sm:px-0">
                <h2 className="text-2xl font-bold mb-6">Échéancier Client/Fournisseur</h2>
                {loading ? (
                    <div>Chargement...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">N° Facture</th>
                                    <th className="px-4 py-2">Nom Client</th>
                                    <th className="px-4 py-2">Montant Facture</th>
                                    <th className="px-4 py-2">Montant payé</th>
                                    <th className="px-4 py-2">Reste à payer</th>
                                    <th className="px-4 py-2">Mode paiement</th>
                                    <th className="px-4 py-2">N° règlement</th>
                                    <th className="px-4 py-2">Date règlement</th>
                                    <th className="px-4 py-2">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reglements.map((r) => (
                                    <tr key={r.id} className="border-b">
                                        <td className="px-4 py-2">{r.facture?.numero_facture || '-'}</td>
                                        <td className="px-4 py-2">{r.facture?.client?.nom || '-'}</td>
                                        <td className="px-4 py-2">{r.facture?.montant_total || '-'}</td>
                                        <td className="px-4 py-2">{r.montant}</td>
                                        <td className="px-4 py-2">{r.facture?.reste_a_payer ?? '-'}</td>
                                        <td className="px-4 py-2">{r.mode_paiement}</td>
                                        <td className="px-4 py-2">{r.numero_reglement}</td>
                                        <td className="px-4 py-2">{r.date_reglement}</td>
                                        <td className="px-4 py-2">{r.facture?.statut_echeance || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
