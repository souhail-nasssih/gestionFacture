<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $clients = Client::paginate(10);
        return inertia('Client/Client', [
            'clients' => $clients,
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

        // Ajouter la validation des données
        $request->validate([
            'nom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:clients,telephone',
            'adresse' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email',
            'delai_paiement' => 'nullable|integer|min:0', // Ex: 30 jours
        ]);
        // Créer le client
        Client::create($request->all());
        // Rediriger ou retourner une réponse
        return redirect()->back()->with('success', 'Client créé avec succès.');
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
        //
        // Ajouter la validation des données
        $request->validate([
            'nom' => 'required|string|max:100',
            'telephone' => 'required|string|max:20|unique:clients,telephone,' . $client->getKey(),
            'adresse' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email,' . $client->getKey(),
            'delai_paiement' => 'nullable|integer|min:0', // Ex: 30 jours
        ]);
        // Mettre à jour le client
        $client->update($request->all());
        // Rediriger ou retourner une réponse
        return redirect()->back()->with('success', 'Client mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        //
        // Supprimer le client
        $client->delete();
        // Rediriger ou retourner une réponse
        return redirect()->back()->with('success', 'Client supprimé avec succès.');
    }
}
