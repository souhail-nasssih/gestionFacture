<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reglements', function (Blueprint $table) {
            try {
                $table->dropForeign(['facture_id']);
            } catch (\Throwable $e) {
                // Constraint may already be removed; ignore
            }
        });
    }

    public function down(): void
    {
        // Intentionally left blank: we don't re-add FK because facture_id can reference two tables based on type
    }
};


