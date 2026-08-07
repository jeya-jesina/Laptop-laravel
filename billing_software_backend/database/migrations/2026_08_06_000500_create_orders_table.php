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
        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->integer('id', true);
                $table->string('order_no', 100)->nullable();
                $table->string('invoice_no', 100)->nullable();
                $table->integer('user_id')->nullable();
                $table->string('customer_name', 150)->nullable();
                $table->string('mobile', 20)->nullable();
                $table->string('email', 150)->nullable();
                $table->text('shipping_address')->nullable();
                $table->text('billing_address')->nullable();
                $table->enum('status', ['pending', 'processing', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'])->default('pending');
                $table->enum('payment_method', ['cash', 'online', 'upi', 'credit'])->default('cash');
                $table->enum('payment_status', ['paid', 'partial', 'pending'])->default('pending');
                $table->decimal('sub_total', 10, 2)->nullable();
                $table->decimal('gst_total', 10, 2)->nullable();
                $table->decimal('total_amount', 10, 2)->nullable();
                $table->decimal('paid_amount', 10, 2)->nullable();
                $table->decimal('balance_amount', 10, 2)->nullable();
                $table->string('tracking_id', 150)->nullable();
                $table->timestamp('shipped_at')->nullable();
                $table->integer('company_id')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index('user_id', 'fk_orders_user');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
