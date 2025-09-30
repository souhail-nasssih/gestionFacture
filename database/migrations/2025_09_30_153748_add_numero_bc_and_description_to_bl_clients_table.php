<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bl_clients', function (Blueprint $table) {
            $table->string('numero_bc')->nullable()->after('numero_bl');
            $table->text('description')->nullable()->after('numero_bc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bl_clients', function (Blueprint $table) {
            $table->dropColumn(['numero_bc', 'description']);
        });
    }
};
