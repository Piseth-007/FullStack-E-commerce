<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\Province;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CambodiaLocationSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $provinces = collect($this->data('cambodia-provinces.ts'))
            ->map(fn (array $province) => [
                'code' => $province['code'],
                'name_en' => $province['nameEn'],
                'name_km' => $province['nameKm'],
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->all();

        DB::table('provinces')->upsert($provinces, ['code'], ['name_en', 'name_km', 'updated_at']);

        $provinceIds = Province::pluck('id', 'code');
        $districts = collect($this->data('cambodia-districts.ts'))
            ->map(fn (array $district) => [
                'code' => $district['code'],
                'province_id' => $provinceIds[$district['provinceCode']],
                'name_en' => $district['nameEn'],
                'name_km' => $district['nameKm'],
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->all();

        DB::table('districts')->upsert(
            $districts,
            ['code'],
            ['province_id', 'name_en', 'name_km', 'updated_at']
        );

        $districtIds = District::pluck('id', 'code');
        $communes = collect($this->data('cambodia-communes.ts'))
            ->map(fn (array $commune) => [
                'code' => $commune['code'],
                'district_id' => $districtIds[$commune['districtCode']],
                'name_en' => $commune['nameEn'],
                'name_km' => $commune['nameKm'],
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->all();

        DB::table('communes')->upsert(
            $communes,
            ['code'],
            ['district_id', 'name_en', 'name_km', 'updated_at']
        );
    }

    private function data(string $file): array
    {
        $contents = file_get_contents(database_path("data/{$file}"));
        $json = preg_replace('/^export const \\w+ = /', '', $contents);
        $data = json_decode(rtrim($json, ";\r\n "), true);

        if (! is_array($data)) {
            throw new RuntimeException("Unable to parse Cambodia location data: {$file}");
        }

        return $data;
    }
}
