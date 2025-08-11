<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('facture_fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('fournisseur_id');
            $table->date('date_facture');
            $table->string('numero_facture')->unique();
            $table->decimal('montant_total', 10, 2)->default(0);
            $table->enum('statut_paiement', ['en_attente', 'payee', 'en_retard'])->default('en_attente');
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facture_fournisseurs');
    }
};
