<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            if (!Schema::hasColumn('reglements', 'numero_reglement')) {
                $table->string('numero_reglement')->nullable()->after('mode_paiement');
            }
            if (!Schema::hasColumn('reglements', 'journal_code')) {
                $table->string('journal_code')->nullable()->after('numero_reglement');
            }
            if (!Schema::hasColumn('reglements', 'compte_general')) {
                $table->string('compte_general')->nullable()->after('journal_code');
            }
            if (!Schema::hasColumn('reglements', 'compte_tiers')) {
                $table->string('compte_tiers')->nullable()->after('compte_general');
            }
            if (!Schema::hasColumn('reglements', 'numero_cheque')) {
                $table->string('numero_cheque')->nullable()->after('compte_tiers');
            }
            if (!Schema::hasColumn('reglements', 'date_echeance_cheque')) {
                $table->date('date_echeance_cheque')->nullable()->after('numero_cheque');
            }
            if (!Schema::hasColumn('reglements', 'devise')) {
                $table->string('devise', 3)->default('MAD')->after('date_echeance_cheque');
            }
            if (!Schema::hasColumn('reglements', 'taux_change')) {
                $table->decimal('taux_change', 12, 6)->default(1)->after('devise');
            }
            if (!Schema::hasColumn('reglements', 'escompte')) {
                $table->decimal('escompte', 10, 2)->default(0)->after('taux_change');
            }
            if (!Schema::hasColumn('reglements', 'frais_bancaires')) {
                $table->decimal('frais_bancaires', 10, 2)->default(0)->after('escompte');
            }
            if (!Schema::hasColumn('reglements', 'observations')) {
                $table->text('observations')->nullable()->after('frais_bancaires');
            }
            if (!Schema::hasColumn('reglements', 'statut')) {
                $table->enum('statut', ['enregistre', 'annule'])->default('enregistre')->after('observations');
            }
            if (!Schema::hasColumn('reglements', 'created_by')) {
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('statut');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            $columns = [
                'numero_reglement','journal_code','compte_general','compte_tiers','numero_cheque','date_echeance_cheque','devise','taux_change','escompte','frais_bancaires','observations','statut','created_by'
            ];
            foreach ($columns as $col) {
                if (Schema::hasColumn('reglements', $col)) {
                    if ($col === 'created_by') {
                        $table->dropConstrainedForeignId('created_by');
                    } else {
                        $table->dropColumn($col);
                    }
                }
            }
        });
    }
};


