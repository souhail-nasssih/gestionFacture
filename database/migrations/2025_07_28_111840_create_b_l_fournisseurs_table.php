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
        Schema::create('b_l_fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('facture_fournisseur_id')->nullable();
            $table->unsignedBigInteger('fournisseur_id');
            $table->date('date_bl');
            $table->string('numero_bl')->unique();
            $table->timestamps();

            $table->foreign('facture_fournisseur_id')->references('id')->on('facture_fournisseurs')->nullOnDelete();
            $table->foreign('fournisseur_id')->references('id')->on('fournisseurs')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('b_l_fournisseurs');
    }
};
