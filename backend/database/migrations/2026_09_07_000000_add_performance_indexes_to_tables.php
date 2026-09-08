<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index('updated_at', 'idx_products_updated_at');
            $table->index('created_at', 'idx_products_created_at');
            $table->index('price', 'idx_products_price');
            $table->index('discount', 'idx_products_discount');
            $table->index('stock', 'idx_products_stock');
            $table->index(['category_id', 'created_at'], 'idx_products_category_created');
            $table->index(['brand_id', 'created_at'], 'idx_products_brand_created');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('created_at', 'idx_orders_created_at');
            $table->index(['status', 'created_at'], 'idx_orders_status_created');
            $table->index(['user_id', 'created_at'], 'idx_orders_user_created');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index('rating', 'idx_reviews_rating');
            $table->index('created_at', 'idx_reviews_created_at');
            $table->index(['product_id', 'created_at'], 'idx_reviews_product_created');
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->index('read_at', 'idx_contacts_read_at');
            $table->index(['read_at', 'created_at'], 'idx_contacts_read_created');
        });

        if (Schema::hasTable('provinces')) {
            Schema::table('provinces', function (Blueprint $table) {
                $table->index('name_en', 'idx_provinces_name_en');
            });
        }

        if (Schema::hasTable('districts')) {
            Schema::table('districts', function (Blueprint $table) {
                $table->index(['province_id', 'name_en'], 'idx_districts_province_name');
            });
        }

        if (Schema::hasTable('communes')) {
            Schema::table('communes', function (Blueprint $table) {
                $table->index(['district_id', 'name_en'], 'idx_communes_district_name');
            });
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_updated_at');
            $table->dropIndex('idx_products_created_at');
            $table->dropIndex('idx_products_price');
            $table->dropIndex('idx_products_discount');
            $table->dropIndex('idx_products_stock');
            $table->dropIndex('idx_products_category_created');
            $table->dropIndex('idx_products_brand_created');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_created_at');
            $table->dropIndex('idx_orders_status_created');
            $table->dropIndex('idx_orders_user_created');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_reviews_rating');
            $table->dropIndex('idx_reviews_created_at');
            $table->dropIndex('idx_reviews_product_created');
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->dropIndex('idx_contacts_read_at');
            $table->dropIndex('idx_contacts_read_created');
        });

        if (Schema::hasTable('provinces')) {
            Schema::table('provinces', function (Blueprint $table) {
                $table->dropIndex('idx_provinces_name_en');
            });
        }

        if (Schema::hasTable('districts')) {
            Schema::table('districts', function (Blueprint $table) {
                $table->dropIndex('idx_districts_province_name');
            });
        }

        if (Schema::hasTable('communes')) {
            Schema::table('communes', function (Blueprint $table) {
                $table->dropIndex('idx_communes_district_name');
            });
        }
    }
};
