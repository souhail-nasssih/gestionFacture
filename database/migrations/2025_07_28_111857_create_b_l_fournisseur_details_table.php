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
        Schema::create('b_l_fournisseur_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('b_l_fournisseur_id');
            $table->unsignedBigInteger('produit_id');
            $table->integer('quantite')->default(0);
            $table->decimal('prix_unitaire', 10, 2)->default(0);
            $table->decimal('montantBL', 10, 2);
            $table->timestamps();
            $table->foreign('b_l_fournisseur_id')->references('id')->on('b_l_fournisseurs');
            $table->foreign('produit_id')->references('id')->on('produits');
        });
    }   

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('b_l_fournisseur_details');
    }
};
