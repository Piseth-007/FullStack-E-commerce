<?php

namespace Database\Seeders;

use App\Models\SkinType;
use Illuminate\Database\Seeder;

class SkinTypeSeeder extends Seeder
{
    public function run(): void
    {
        $skinTypes = [
            [
                'name' => 'Oily',
                'description' => 'Skin that produces excess sebum, often shiny with enlarged pores and prone to acne.',
            ],
            [
                'name' => 'Dry',
                'description' => 'Skin that lacks natural oils, often feels tight, flaky, or rough.',
            ],
            [
                'name' => 'Combination',
                'description' => 'Skin that is oily in the T-zone (forehead, nose, chin) but dry or normal elsewhere.',
            ],
            [
                'name' => 'Sensitive',
                'description' => 'Skin that reacts easily to products or environmental factors, prone to redness or irritation.',
            ],
            [
                'name' => 'Normal',
                'description' => 'Well-balanced skin, not too oily or too dry, with minimal sensitivity.',
            ],
            [
                'name' => 'Acne-Prone',
                'description' => 'Skin that frequently develops breakouts, blackheads, or clogged pores.',
            ],
        ];

        foreach ($skinTypes as $skinType) {
            SkinType::firstOrCreate(
                ['name' => $skinType['name']],
                ['description' => $skinType['description']],
            );
        }
    }
}
