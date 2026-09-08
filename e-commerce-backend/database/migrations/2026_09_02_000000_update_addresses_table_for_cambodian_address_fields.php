<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replace the legacy address fields with the fields used by App\Models\Address.
     */
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->string('telephone', 30)->nullable()->after('full_name');
            $table->string('city_province', 100)->nullable()->after('telephone');
            $table->string('district', 100)->nullable()->after('city_province');
            $table->string('commune', 100)->nullable()->after('district');
            $table->string('street')->nullable()->after('commune');
            $table->string('label', 100)->nullable()->after('street');
        });

        DB::table('addresses')->orderBy('id')->chunkById(100, function ($addresses) {
            foreach ($addresses as $address) {
                $cityProvince = implode(', ', array_filter([
                    $address->city,
                    $address->province_state,
                ]));

                $street = implode(', ', array_filter([
                    $address->street_address,
                    $address->complex_unit,
                    $address->suburb,
                ]));

                DB::table('addresses')->where('id', $address->id)->update([
                    'telephone' => $address->phone,
                    'city_province' => $cityProvince,
                    'district' => $address->suburb,
                    'commune' => $address->complex_unit,
                    'street' => $street,
                    'label' => $address->type,
                ]);
            }
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn([
                'type',
                'phone',
                'street_address',
                'complex_unit',
                'suburb',
                'city',
                'province_state',
                'postal_code',
                'country',
                'delivery_instructions',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->enum('type', ['home', 'work', 'other'])->default('home')->after('user_id');
            $table->string('phone', 30)->nullable()->after('full_name');
            $table->string('street_address')->nullable()->after('phone');
            $table->string('complex_unit')->nullable()->after('street_address');
            $table->string('suburb')->nullable()->after('complex_unit');
            $table->string('city', 100)->nullable()->after('suburb');
            $table->string('province_state', 100)->nullable()->after('city');
            $table->string('postal_code', 20)->nullable()->after('province_state');
            $table->string('country', 100)->nullable()->after('postal_code');
            $table->text('delivery_instructions')->nullable()->after('country');
        });

        DB::table('addresses')->orderBy('id')->chunkById(100, function ($addresses) {
            foreach ($addresses as $address) {
                DB::table('addresses')->where('id', $address->id)->update([
                    'type' => in_array($address->label, ['home', 'work', 'other'], true)
                        ? $address->label
                        : 'home',
                    'phone' => $address->telephone,
                    'street_address' => $address->street,
                    'complex_unit' => $address->commune,
                    'suburb' => $address->district,
                    'city' => $address->city_province,
                    'province_state' => $address->city_province,
                    'country' => 'Cambodia',
                ]);
            }
        });

        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn([
                'telephone',
                'city_province',
                'district',
                'commune',
                'street',
                'label',
            ]);
        });
    }
};
