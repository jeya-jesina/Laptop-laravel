<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('payment_method', ['cash', 'online', 'upi', 'credit', 'cod'])->default('cash')->change();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->enum('payment_method', ['cash', 'online', 'upi', 'credit', 'loyalty', 'cod'])->nullable()->change();
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->enum('payment_method', ['cash', 'online', 'upi', 'credit', 'loyalty', 'cod'])->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('payment_method', ['cash', 'online', 'upi', 'credit'])->default('cash')->change();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->enum('payment_method', ['cash', 'online', 'upi', 'credit', 'loyalty'])->nullable()->change();
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->enum('payment_method', ['cash', 'online', 'upi', 'credit', 'loyalty'])->nullable()->change();
        });
    }
};
