<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bl_clients', function (Blueprint $table) {
            $table->foreignId('facture_client_id')->nullable()->after('client_id')
                ->constrained('facture_clients')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bl_clients', function (Blueprint $table) {
            $table->dropConstrainedForeignId('facture_client_id');
        });
    }
};
