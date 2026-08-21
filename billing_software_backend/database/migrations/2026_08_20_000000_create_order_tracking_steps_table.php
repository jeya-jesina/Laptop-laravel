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
        if (!Schema::hasTable('order_tracking_steps')) {
            Schema::create('order_tracking_steps', function (Blueprint $table) {
                $table->integer('id', true);
                $table->integer('order_id');
                $table->string('step_key', 50);
                $table->string('step_label', 100);
                $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
                $table->timestamp('completed_at')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent();

                $table->index('order_id', 'fk_order_tracking_steps_order');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_tracking_steps');
    }
};