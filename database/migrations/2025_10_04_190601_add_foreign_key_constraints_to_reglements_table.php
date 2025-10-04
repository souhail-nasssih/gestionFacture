<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            // Ajouter un index pour améliorer les performances
            $table->index(['facture_id', 'type']);

            // Ajouter une contrainte pour s'assurer que le type est valide
            $table->check('type IN ("client", "fournisseur")');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            // Supprimer l'index
            $table->dropIndex(['facture_id', 'type']);

            // Supprimer la contrainte de vérification
            $table->dropCheck('type IN ("client", "fournisseur")');
        });
    }
};
