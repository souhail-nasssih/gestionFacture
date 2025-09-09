<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            if (!Schema::hasColumn('reglements', 'date_reglement_at')) {
                $table->dateTime('date_reglement_at')->nullable()->after('type_reglement');
            }
        });

        // Backfill from existing date_reglement if present
        if (Schema::hasColumn('reglements', 'date_reglement') && Schema::hasColumn('reglements', 'date_reglement_at')) {
            DB::statement("UPDATE reglements SET date_reglement_at = CONCAT(date_reglement, ' 00:00:00') WHERE date_reglement IS NOT NULL AND date_reglement_at IS NULL");
        }
    }

    public function down(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            if (Schema::hasColumn('reglements', 'date_reglement_at')) {
                $table->dropColumn('date_reglement_at');
            }
        });
    }
};


