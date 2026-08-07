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
        if (!Schema::hasTable('banners')) {
            return;
        }

        Schema::table('banners', function (Blueprint $table) {
            if (!Schema::hasColumn('banners', 'subtitle')) {
                $table->string('subtitle', 255)->nullable()->after('title');
            }
            if (!Schema::hasColumn('banners', 'badge')) {
                $table->string('badge', 100)->nullable()->after('description');
            }
            if (!Schema::hasColumn('banners', 'price')) {
                $table->decimal('price', 12, 2)->nullable()->after('badge');
            }
            if (!Schema::hasColumn('banners', 'mrp')) {
                $table->decimal('mrp', 12, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('banners', 'bg_color')) {
                $table->string('bg_color', 20)->nullable()->after('mrp');
            }
            if (!Schema::hasColumn('banners', 'rating')) {
                $table->decimal('rating', 2, 1)->nullable()->after('bg_color');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('banners')) {
            return;
        }

        Schema::table('banners', function (Blueprint $table) {
            $columns = ['subtitle', 'badge', 'price', 'mrp', 'bg_color', 'rating'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('banners', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
