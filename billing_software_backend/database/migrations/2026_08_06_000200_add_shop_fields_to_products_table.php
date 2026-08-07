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
                if (!Schema::hasColumn('products', 'image')) {
                    $table->string('image', 255)->nullable()->after('description');
                }
                if (!Schema::hasColumn('products', 'offer_price')) {
                    $table->decimal('offer_price', 10, 2)->nullable()->after('price');
                }
                if (!Schema::hasColumn('products', 'original_price')) {
                    $table->decimal('original_price', 10, 2)->nullable()->after('offer_price');
                }
                if (!Schema::hasColumn('products', 'view_count')) {
                    $table->integer('view_count')->default(0)->after('stock');
                }
                if (!Schema::hasColumn('products', 'video_url')) {
                    $table->string('video_url', 255)->nullable()->after('image');
                }
                if (!Schema::hasColumn('products', 'image_gallery_json')) {
                    $table->text('image_gallery_json')->nullable()->after('video_url');
                }
                if (!Schema::hasColumn('products', 'short_description')) {
                    $table->text('short_description')->nullable()->after('description');
                }
                if (!Schema::hasColumn('products', 'full_description')) {
                    $table->text('full_description')->nullable()->after('short_description');
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
                $cols = ['full_description', 'short_description', 'image_gallery_json', 'video_url', 'view_count', 'original_price', 'offer_price', 'image'];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('products', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
