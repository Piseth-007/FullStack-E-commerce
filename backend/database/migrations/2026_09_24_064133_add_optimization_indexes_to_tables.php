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
                $table->index('deleted_at', 'idx_products_deleted_at');
                $table->index('name', 'idx_products_name');
                $table->index(['deleted_at', 'category_id'], 'idx_products_deleted_category');
                $table->index(['deleted_at', 'brand_id'], 'idx_products_deleted_brand');
                $table->index(['deleted_at', 'price'], 'idx_products_deleted_price');
                $table->index(['deleted_at', 'created_at'], 'idx_products_deleted_created');
            });
        }

        if (Schema::hasTable('addresses')) {
            Schema::table('addresses', function (Blueprint $table) {
                $table->index(['user_id', 'deleted_at'], 'idx_addresses_user_deleted');
            });
        }

        if (Schema::hasTable('cart_items')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->index(['cart_id', 'product_id'], 'idx_cart_items_cart_product');
            });
        }

        if (Schema::hasTable('product_skin_type')) {
            Schema::table('product_skin_type', function (Blueprint $table) {
                $table->index('skin_type_id', 'idx_product_skin_type_skin_type_id');
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
                $table->dropIndex('idx_products_deleted_at');
                $table->dropIndex('idx_products_name');
                $table->dropIndex('idx_products_deleted_category');
                $table->dropIndex('idx_products_deleted_brand');
                $table->dropIndex('idx_products_deleted_price');
                $table->dropIndex('idx_products_deleted_created');
            });
        }

        if (Schema::hasTable('addresses')) {
            Schema::table('addresses', function (Blueprint $table) {
                $table->dropIndex('idx_addresses_user_deleted');
            });
        }

        if (Schema::hasTable('cart_items')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->dropIndex('idx_cart_items_cart_product');
            });
        }

        if (Schema::hasTable('product_skin_type')) {
            Schema::table('product_skin_type', function (Blueprint $table) {
                $table->dropIndex('idx_product_skin_type_skin_type_id');
            });
        }
    }
};
