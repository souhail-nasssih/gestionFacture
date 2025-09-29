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
            // Modify the type_reglement column to include 'LCN'
            $table->enum('type_reglement', ['espèces', 'chèque', 'virement', 'LCN'])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            // Remove 'LCN' from the enum
            $table->enum('type_reglement', ['espèces', 'chèque', 'virement'])->change();
        });
    }
};
