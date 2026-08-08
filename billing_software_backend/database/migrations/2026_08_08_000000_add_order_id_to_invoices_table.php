<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Link storefront orders to their invoice record.
     */
    public function up(): void
    {
        if (Schema::hasTable('invoices')) {
            Schema::table('invoices', function (Blueprint $table) {
                if (!Schema::hasColumn('invoices', 'order_id')) {
                    $table->integer('order_id')->nullable()->index();
                }
                if (!Schema::hasColumn('invoices', 'shipping_address')) {
                    $table->text('shipping_address')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('invoices')) {
            Schema::table('invoices', function (Blueprint $table) {
                if (Schema::hasColumn('invoices', 'order_id')) {
                    $table->dropColumn('order_id');
                }
                if (Schema::hasColumn('invoices', 'shipping_address')) {
                    $table->dropColumn('shipping_address');
                }
            });
        }
    }
};
