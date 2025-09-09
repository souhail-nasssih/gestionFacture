<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            $columns = [
                'numero_reglement',
                'journal_code',
                'compte_general',
                'compte_tiers',
                'numero_cheque',
                'date_echeance_cheque',
                'banque_nom',
                'reference_paiement',
                'iban_rib',
                'devise',
                'taux_change',
                'escompte',
                'frais_bancaires',
                'observations',
                'statut',
            ];
            foreach ($columns as $col) {
                if (Schema::hasColumn('reglements', $col)) {
                    try { $table->dropColumn($col); } catch (\Throwable $e) {}
                }
            }
            if (Schema::hasColumn('reglements', 'created_by')) {
                try { $table->dropConstrainedForeignId('created_by'); } catch (\Throwable $e) { try { $table->dropColumn('created_by'); } catch (\Throwable $e2) {} }
            }
        });
    }

    public function down(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            // No-op: we won't recreate dropped optional columns
        });
    }
};


