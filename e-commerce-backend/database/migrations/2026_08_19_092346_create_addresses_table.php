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
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('type', ['home', 'work', 'other'])->default('home');
            $table->string('full_name');
            $table->string('phone');
            $table->string('street_address');
            $table->string('complex_unit')->nullable();
            $table->string('suburb')->nullable();
            $table->string('city');
            $table->string('province_state');
            $table->string('postal_code');
            $table->string('country')->default('Cambodia');

            $table->text('delivery_instructions')->nullable();
            $table->boolean('is_default')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};