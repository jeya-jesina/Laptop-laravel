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
        if (Schema::hasTable('products') && !Schema::hasColumn('products', 'home_budget')) {
            Schema::table('products', function (Blueprint $table) {
                $table->tinyInteger('home_budget')->default(0)->after('is_offer');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('products') && Schema::hasColumn('products', 'home_budget')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('home_budget');
            });
        }
    }
};
