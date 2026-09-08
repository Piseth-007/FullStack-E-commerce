<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('code', 2)->unique();
            $table->string('name_en');
            $table->string('name_km');
            $table->timestamps();
        });

        Schema::create('districts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 4)->unique();
            $table->foreignId('province_id')->constrained()->cascadeOnDelete();
            $table->string('name_en');
            $table->string('name_km');
            $table->timestamps();
        });

        Schema::create('communes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 6)->unique();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->string('name_en');
            $table->string('name_km');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communes');
        Schema::dropIfExists('districts');
        Schema::dropIfExists('provinces');
    }
};
