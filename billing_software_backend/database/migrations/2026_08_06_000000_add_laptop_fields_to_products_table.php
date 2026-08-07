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
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'model')) {
                    $table->string('model', 150)->nullable();
                }
                if (!Schema::hasColumn('products', 'processor')) {
                    $table->string('processor', 150)->nullable();
                }
                if (!Schema::hasColumn('products', 'ram')) {
                    $table->string('ram', 100)->nullable();
                }
                if (!Schema::hasColumn('products', 'storage')) {
                    $table->string('storage', 100)->nullable();
                }
                if (!Schema::hasColumn('products', 'storage_type')) {
                    $table->string('storage_type', 100)->nullable();
                }
                if (!Schema::hasColumn('products', 'graphics')) {
                    $table->string('graphics', 150)->nullable();
                }
                if (!Schema::hasColumn('products', 'display_size')) {
                    $table->string('display_size', 100)->nullable();
                }
                if (!Schema::hasColumn('products', 'operating_system')) {
                    $table->string('operating_system', 150)->nullable();
                }
                if (!Schema::hasColumn('products', 'condition_grade')) {
                    $table->string('condition_grade', 100)->nullable();
                }
                if (!Schema::hasColumn('products', 'battery_health')) {
                    $table->string('battery_health', 100)->nullable();
                }
                if (!Schema::hasColumn('products', 'warranty')) {
                    $table->string('warranty', 100)->nullable();
                }
                if (!Schema::hasColumn('products', 'charger_available')) {
                    $table->tinyInteger('charger_available')->default(0);
                }
                if (!Schema::hasColumn('products', 'description')) {
                    $table->text('description')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('products')) {
            Schema::table('products', function (Blueprint $table) {
                if (Schema::hasColumn('products', 'model')) {
                    $table->dropColumn('model');
                }
                if (Schema::hasColumn('products', 'processor')) {
                    $table->dropColumn('processor');
                }
                if (Schema::hasColumn('products', 'ram')) {
                    $table->dropColumn('ram');
                }
                if (Schema::hasColumn('products', 'storage')) {
                    $table->dropColumn('storage');
                }
                if (Schema::hasColumn('products', 'storage_type')) {
                    $table->dropColumn('storage_type');
                }
                if (Schema::hasColumn('products', 'graphics')) {
                    $table->dropColumn('graphics');
                }
                if (Schema::hasColumn('products', 'display_size')) {
                    $table->dropColumn('display_size');
                }
                if (Schema::hasColumn('products', 'operating_system')) {
                    $table->dropColumn('operating_system');
                }
                if (Schema::hasColumn('products', 'condition_grade')) {
                    $table->dropColumn('condition_grade');
                }
                if (Schema::hasColumn('products', 'battery_health')) {
                    $table->dropColumn('battery_health');
                }
                if (Schema::hasColumn('products', 'warranty')) {
                    $table->dropColumn('warranty');
                }
                if (Schema::hasColumn('products', 'charger_available')) {
                    $table->dropColumn('charger_available');
                }
                if (Schema::hasColumn('products', 'description')) {
                    $table->dropColumn('description');
                }
            });
        }
    }
};
