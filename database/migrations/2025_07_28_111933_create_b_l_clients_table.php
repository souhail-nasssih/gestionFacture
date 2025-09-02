<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('bl_clients', function (Blueprint $table) {
            $table->id();
            $table->string('numero_bl')->unique();
            $table->date('date_bl');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->enum('statut', ['brouillon', 'validé', 'livré', 'facturé'])->default('brouillon');
            $table->timestamps();
        });

        Schema::create('bl_client_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bl_client_id')->constrained()->onDelete('cascade');
            $table->foreignId('produit_id')->constrained()->onDelete('cascade');
            $table->integer('quantite');
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('montant', 10, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('bl_client_details');
        Schema::dropIfExists('bl_clients');
    }
};
