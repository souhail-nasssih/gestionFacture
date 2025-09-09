<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            if (!Schema::hasColumn('reglements', 'montant_paye')) {
                $table->decimal('montant_paye', 10, 2)->nullable()->after('facture_id');
            }
        });

        // Backfill montant_paye from montant if present
        if (Schema::hasColumn('reglements', 'montant') && Schema::hasColumn('reglements', 'montant_paye')) {
            DB::statement('UPDATE reglements SET montant_paye = montant WHERE montant_paye IS NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            if (Schema::hasColumn('reglements', 'montant_paye')) {
                $table->dropColumn('montant_paye');
            }
        });
    }
};


