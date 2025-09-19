<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facture_clients', function (Blueprint $table) {
            if (!Schema::hasColumn('facture_clients', 'date_echeance')) {
                $table->date('date_echeance')->nullable()->after('date_facture');
            }
        });
    }

    public function down(): void
    {
        Schema::table('facture_clients', function (Blueprint $table) {
            if (Schema::hasColumn('facture_clients', 'date_echeance')) {
                $table->dropColumn('date_echeance');
            }
        });
    }
};
