<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            if (!Schema::hasColumn('reglements', 'type_reglement')) {
                $table->enum('type_reglement', ['espèces', 'virement', 'chèque'])->default('espèces')->after('type');
            }
            if (!Schema::hasColumn('reglements', 'infos_reglement')) {
                $table->json('infos_reglement')->nullable()->after('type_reglement');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            if (Schema::hasColumn('reglements', 'infos_reglement')) {
                $table->dropColumn('infos_reglement');
            }
            if (Schema::hasColumn('reglements', 'type_reglement')) {
                $table->dropColumn('type_reglement');
            }
        });
    }
};


