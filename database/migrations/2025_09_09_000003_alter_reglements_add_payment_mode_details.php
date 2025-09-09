<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            if (!Schema::hasColumn('reglements', 'banque_nom')) {
                $table->string('banque_nom')->nullable()->after('numero_cheque');
            }
            if (!Schema::hasColumn('reglements', 'reference_paiement')) {
                $table->string('reference_paiement')->nullable()->after('banque_nom');
            }
            if (!Schema::hasColumn('reglements', 'iban_rib')) {
                $table->string('iban_rib')->nullable()->after('reference_paiement');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            foreach (['banque_nom','reference_paiement','iban_rib'] as $col) {
                if (Schema::hasColumn('reglements', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};


