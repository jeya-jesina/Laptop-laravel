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
        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->integer('id', true);
                $table->integer('order_id')->nullable();
                $table->integer('product_id')->nullable();
                $table->string('product_name', 200)->nullable();
                $table->string('image', 255)->nullable();
                $table->string('size', 50)->nullable();
                $table->decimal('price', 10, 2)->nullable();
                $table->integer('quantity')->default(1);
                $table->decimal('gst_percentage', 5, 2)->nullable();
                $table->decimal('total', 10, 2)->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index('order_id', 'fk_order_items_order');
                $table->index('product_id', 'fk_order_items_product');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
