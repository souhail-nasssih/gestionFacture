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
    const [selectedStatus, setSelectedStatus] = useState(
        filters?.statut || "tous"
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [historyFacture, setHistoryFacture] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Define available status options
    const statusOptions = [
        { value: "tous", label: "Tous les statuts" },
        { value: "payée", label: "Payée" },
        { value: "en attente", label: "En attente" },
        { value: "partiellement payée", label: "Partiellement payée" },
        { value: "en retard", label: "En retard" },
    ];

    // Filtrer les factures en fonction du type sélectionné, statut et du terme de recherche
    const filteredFactures = useMemo(() => {
        let filtered = allFactures;

        // Filtrer par type
        if (selectedType !== "tous") {
            filtered = filtered.filter((f) => f.type === selectedType);
        }

        // Filtrer par statut (case-insensitive, trimmed)
        if (selectedStatus !== "tous") {
            const normalize = (s) => (s || "").toString().trim().toLowerCase();
            const selectedNorm = normalize(selectedStatus);
            filtered = filtered.filter((f) => normalize(f.statut) === selectedNorm);
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
    }, [allFactures, selectedType, selectedStatus, searchTerm]);

    // Mettre à jour l'URL quand le type ou le statut change
    useEffect(() => {
        const params = {};
        if (selectedType !== "tous") params.type = selectedType;
        if (selectedStatus !== "tous") params.statut = selectedStatus;

        router.get(route("echeancier.index"), params, {
            preserveState: true,
            replace: true,
        });
    }, [selectedType, selectedStatus]);

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
    // Fonction pour rafraîchir les données d'une facture
    async function refreshFactureData(factureId, type) {
        try {
            const response = await fetch(
                route("echeancier.getFacture", { id: factureId, type: type })
            );
            const updatedFacture = await response.json();

            setAllFactures((prevFactures) =>
                prevFactures.map((f) =>
                    f.id === factureId ? { ...f, ...updatedFacture } : f
                )
            );

            if (historyFacture?.id === factureId) {
                setHistoryFacture((prev) => ({ ...prev, ...updatedFacture }));
            }

            return updatedFacture;
        } catch (error) {
            console.error(
                "Erreur lors du rafraîchissement de la facture:",
                error
            );
            return null;
        }
    }

    async function openHistory(facture) {
        if (!facture) return;

        setHistoryFacture(facture);
        setLoadingHistory(true);
        setHistory([]); // Réinitialiser l'historique

        try {
            // Lancer les deux requêtes en parallèle
            const [reglements, updatedFacture] = await Promise.all([
                fetch(
                    route("reglements.byFacture", {
                        type: facture.type,
                        id: facture.id,
                    })
                ).then(async (r) => {
                    if (!r.ok)
                        throw new Error(
                            "Erreur lors de la récupération des règlements"
                        );
                    const data = await r.json();
                    return Array.isArray(data) ? data : [];
                }),
                refreshFactureData(facture.id, facture.type),
            ]);

            console.log("Règlements reçus:", reglements); // Pour le débogage

            // Trier les règlements par date
            const sortedReglements = reglements.sort((a, b) => {
                const dateA = a.date_reglement || a.created_at;
                const dateB = b.date_reglement || b.created_at;
                return new Date(dateB) - new Date(dateA);
            });

            // Mettre à jour l'historique des règlements
            setHistory(sortedReglements);
        } catch (error) {
            console.error("Erreur lors du chargement de l'historique:", error);
            setHistory([]); // Réinitialiser en cas d'erreur
        } finally {
            setLoadingHistory(false);
        }
    }

    function startEdit(r) {
        setEditingId(r.id);
        setSelectedFacture(historyFacture);

        // Format the date
        const dateObj = r.date_reglement_at
            ? new Date(r.date_reglement_at)
            : new Date();
        const formattedDate = dateObj.toISOString().split("T")[0];
        const formattedTime = dateObj.toTimeString().slice(0, 5);
        const formattedDateTime = `${formattedDate}T${formattedTime}:00`;

        // Parse infos_reglement
        const infos =
            typeof r.infos_reglement === "string"
                ? JSON.parse(r.infos_reglement)
                : r.infos_reglement || {};

        // Log the reglement data for debugging
        console.log("Editing reglement:", r);

        form.setData({
            facture_id: historyFacture.id,
            type: historyFacture.type,
            type_reglement: r.type_reglement || "espèces",
            montant_paye: r.montant_paye,
            date_reglement: formattedDate,
            date_reglement_at: formattedDateTime,
            numero_reglement: r.numero_reglement || "", // Ensure this value is set
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
            facture_id: form.data.facture_id,
            type: form.data.type,
            montant_paye: parseFloat(form.data.montant_paye).toFixed(2),
            type_reglement: form.data.type_reglement,
            date_reglement: form.data.date_reglement,
            date_reglement_at: form.data.date_reglement_at,
            numero_reglement: form.data.numero_reglement || null, // Ensure null if empty
            numero_cheque: form.data.numero_cheque,
            banque_nom: form.data.banque_nom,
            iban_rib: form.data.iban_rib,
            reference_paiement: form.data.reference_paiement,
            infos_reglement: infos,
        };

        // Log the submission data for debugging
        console.log("Submitting reglement:", formData);

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
                    router.get(
                        route("echeancier.index"),
                        {},
                        { replace: true }
                    );
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
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusOptions={statusOptions}
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
