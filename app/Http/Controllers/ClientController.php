<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ClientDetailExport;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $clients = Client::paginate(10);
        return inertia('Client/index', [
            'clients' => $clients,
        ]);
    }
    /**
     * Afficher le détail d'un client avec toutes ses informations
     */
    public function detail($id)
    {
        $client = Client::with([
            'factures' => function($query) {
                $query->with('reglements')->orderBy('date_facture', 'desc');
            },
            'reglements' => function($query) {
                $query->with('facture')->orderBy('date_reglement', 'desc');
            }
        ])->findOrFail($id);

        // Calculer les statistiques
        $stats = [
            'montant_total_factures' => $client->montant_total_factures,
            'montant_total_paye' => $client->montant_total_paye,
            'reste_a_payer' => $client->reste_a_payer,
            'nombre_factures' => $client->factures->count(),
            'nombre_reglements' => $client->reglements->count(),
        ];

        return inertia('Client/Detail', [
            'client' => $client,
            'stats' => $stats,
            'factures' => $client->factures,
            'reglements' => $client->reglements,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:clients,telephone',
            'adresse' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email',
            'delai_paiement' => 'nullable|integer|min:0',
        ]);

        Client::create($request->all());

        // Redirect to index instead of back
        return redirect()->route('clients.index')->with('success', 'Client créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        $request->validate([
            'nom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:clients,telephone,' . $client->getKey(),
            'adresse' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email,' . $client->getKey(),
            'delai_paiement' => 'nullable|integer|min:0',
        ]);

        $client->update($request->all());

        // Redirect to index instead of back
        return redirect()->route('clients.index')->with('success', 'Client mis à jour avec succès.');
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        // Redirect to index instead of back
        return redirect()->route('clients.index')->with('success', 'Client supprimé avec succès.');
    }

    /**
     * Exporter le détail client en PDF
     */
    public function exportPdf($id)
    {
        $client = Client::with([
            'factures' => function($query) {
                $query->with('reglements')->orderBy('date_facture', 'desc');
            },
            'reglements' => function($query) {
                $query->with('facture')->orderBy('date_reglement', 'desc');
            }
        ])->findOrFail($id);

        $stats = [
            'montant_total_factures' => $client->montant_total_factures,
            'montant_total_paye' => $client->montant_total_paye,
            'reste_a_payer' => $client->reste_a_payer,
            'nombre_factures' => $client->factures->count(),
            'nombre_reglements' => $client->reglements->count(),
        ];

        $pdf = Pdf::loadView('pdf.client-detail', compact('client', 'stats'));
        return $pdf->download("detail-client-{$client->nom}-" . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Exporter le détail client en Excel
     */
    public function exportExcel($id)
    {
        $client = Client::with([
            'factures' => function($query) {
                $query->with('reglements')->orderBy('date_facture', 'desc');
            },
            'reglements' => function($query) {
                $query->with('facture')->orderBy('date_reglement', 'desc');
            }
        ])->findOrFail($id);

        return Excel::download(new ClientDetailExport($client), "detail-client-{$client->nom}-" . now()->format('Y-m-d') . '.xlsx');
    }
}
