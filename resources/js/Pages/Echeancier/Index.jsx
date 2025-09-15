import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useEffect, useState, useMemo } from "react";
import { useForm, router } from "@inertiajs/react";
import FiltersSection from "../../Components/Echeancier/FiltersSection";
import FacturesTable from "../../Components/Echeancier/FacturesTable";
import HistoryModal from "../../Components/Echeancier/HistoryModal";
import PaymentModal from "../../Components/Echeancier/PaymentModal";
import { getStatusBadge } from "../../Components/Echeancier/utils";

export default function Echeancier({
    factures: initialFactures,
    filters,
    modesPaiement,
}) {
    const [allFactures, setAllFactures] = useState(initialFactures);
    const [selectedType, setSelectedType] = useState(filters?.type || "tous");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [historyFacture, setHistoryFacture] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Filtrer les factures en fonction du type sélectionné et du terme de recherche
    const filteredFactures = useMemo(() => {
        let filtered = allFactures;

        // Filtrer par type
        if (selectedType !== "tous") {
            filtered = filtered.filter((f) => f.type === selectedType);
        }

        // Filtrer par terme de recherche
        if (searchTerm) {
            const term = searchTerm.trim().toLowerCase();
            filtered = filtered.filter(
                (f) =>
                    f.numero_facture.toLowerCase().includes(term) ||
                    (f.nom_entite && f.nom_entite.toLowerCase().includes(term))
            );
        }

        return filtered;
    }, [allFactures, selectedType, searchTerm]);

    // Mettre à jour l'URL quand le type change
    useEffect(() => {
        const params = {};
        if (selectedType !== "tous") params.type = selectedType;

        router.get(route("echeancier.index"), params, {
            preserveState: true,
            replace: true,
        });
    }, [selectedType]);

    const form = useForm({
        facture_id: "",
        type: "",
        type_reglement: "espèces",
        montant_paye: "",
        date_reglement: new Date().toISOString().slice(0, 10),
        date_reglement_at: new Date().toISOString(),
        numero_reglement: "",
        numero_cheque: "",
        banque_nom: "",
        iban_rib: "",
        reference_paiement: "",
        infos_reglement: {},
    });

    useEffect(() => {
        if (selectedFacture) {
            form.setData({
                ...form.data,
                facture_id: selectedFacture.id,
                type: selectedFacture.type,
            });
        }
    }, [selectedFacture]);

    function openHistory(facture) {
        setHistoryFacture(facture);
        setLoadingHistory(true);
        fetch(route("reglements.byFacture", { type: facture.type, id: facture.id }))
            .then((r) => r.json())
            .then((data) => {
                setHistory(
                    (data || []).sort((a, b) =>
                        (a.date_reglement || "") > (b.date_reglement || "")
                            ? 1
                            : -1
                    )
                );
                setLoadingHistory(false);
            });
    }

    function startEdit(r) {
        setEditingId(r.id);
        setSelectedFacture(historyFacture);

        const infos =
            typeof r.infos_reglement === "string"
                ? JSON.parse(r.infos_reglement)
                : r.infos_reglement || {};

        form.setData({
            facture_id: r.facture_id,
            type_reglement: r.type_reglement,
            montant_paye: r.montant_paye,
            date_reglement: r.date_reglement,
            date_reglement_at: r.date_reglement_at,
            numero_reglement: r.numero_reglement || "",
            numero_cheque: infos.numero_cheque || "",
            banque_nom: infos.banque_nom || "",
            iban_rib: infos.iban_rib || "",
            reference_paiement: infos.reference_paiement || "",
            infos_reglement: infos,
        });
    }

    function submitReglement() {
        // Préparer les infos de règlement selon le type
        const infos = {};
        if (form.data.type_reglement === "chèque") {
            infos.numero_cheque = form.data.numero_cheque;
            infos.banque_nom = form.data.banque_nom;
        } else if (form.data.type_reglement === "virement") {
            infos.banque_nom = form.data.banque_nom;
            infos.iban_rib = form.data.iban_rib;
            infos.reference_paiement = form.data.reference_paiement;
        }

        // Prepare the complete data object with all required fields
        const formData = {
            facture_id: selectedFacture.id,
            type: selectedFacture.type,
            montant_paye: form.data.montant_paye,
            type_reglement: form.data.type_reglement,
            date_reglement: form.data.date_reglement,
            date_reglement_at: form.data.date_reglement_at,
            numero_reglement: form.data.numero_reglement,
            numero_cheque: form.data.numero_cheque,
            banque_nom: form.data.banque_nom,
            iban_rib: form.data.iban_rib,
            reference_paiement: form.data.reference_paiement,
            infos_reglement: infos,
        };

        // Set all the form data at once
        form.setData(formData);

        if (editingId) {
            form.put(route("reglements.update", editingId), {
                data: formData, // pass directly here
                onSuccess: () => {
                    setSelectedFacture(null);
                    setEditingId(null);
                    if (historyFacture) openHistory(historyFacture);
                    router.reload();
                },
            });
        } else {
            form.post(route("reglements.store"), {
                data: formData, // pass directly here
                onSuccess: () => {
                    setSelectedFacture(null);
                    if (historyFacture) openHistory(historyFacture);
                    router.get(route("echeancier.index"), {}, { replace: true });

                },
                onError: (errors) => {
                    console.log("Form errors:", errors);
                },
            });
        }
    }
    return (
        <AuthenticatedLayout header={"Échéancier"}>
            <div className="space-y-6">
                <FiltersSection
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />

                <FacturesTable
                    filteredFactures={filteredFactures}
                    getStatusBadge={getStatusBadge}
                    setSelectedFacture={setSelectedFacture}
                    setEditingId={setEditingId}
                    form={form}
                    openHistory={openHistory}
                />

                {historyFacture && (
                    <HistoryModal
                        historyFacture={historyFacture}
                        setHistoryFacture={setHistoryFacture}
                        loadingHistory={loadingHistory}
                        history={history}
                        startEdit={startEdit}
                        form={form}
                        openHistory={openHistory}
                    />
                )}

                {selectedFacture && (
                    <PaymentModal
                        selectedFacture={selectedFacture}
                        setSelectedFacture={setSelectedFacture}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        form={form}
                        modesPaiement={modesPaiement}
                        submitReglement={submitReglement}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
