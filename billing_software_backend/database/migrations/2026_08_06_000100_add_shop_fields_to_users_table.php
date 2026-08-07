<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('phone');
            }
        });

        // Allow the 'user' role for e-commerce customers
        try {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin','admin','cashier','user') NULL");
        } catch (\Exception $e) {
            logger()->error("Failed to alter users.role enum: " . $e->getMessage());
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('users', 'phone')) {
                $table->dropColumn('phone');
            }
        });

        try {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('superadmin','admin','cashier') NULL");
        } catch (\Exception $e) {
            logger()->error("Failed to revert users.role enum: " . $e->getMessage());
        }
    }
};
