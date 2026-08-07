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
        if (!Schema::hasTable('shop_wishlists')) {
            Schema::create('shop_wishlists', function (Blueprint $table) {
                $table->integer('id', true);
                $table->integer('user_id')->nullable();
                $table->integer('product_id')->nullable();
                $table->string('size', 50)->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index('user_id', 'fk_shop_wishlists_user');
                $table->index('product_id', 'fk_shop_wishlists_product');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_wishlists');
    }
};
