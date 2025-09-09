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
                $table->string('numero_reglement')->nullable()->after('type_reglement');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            if (Schema::hasColumn('reglements', 'numero_reglement')) {
                $table->dropColumn('numero_reglement');
            }
        });
    }
};


