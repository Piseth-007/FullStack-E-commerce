<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\Province;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
    public function provinces()
    {
        $provinces = Cache::rememberForever('locations:provinces', function () {
            return Province::query()->orderBy('name_en')->get(['id', 'code', 'name_en', 'name_km']);
        });

        return response()->json($provinces);
    }

    public function districts(Province $province)
    {
        $districts = Cache::rememberForever("locations:districts:{$province->id}", function () use ($province) {
            return $province->districts()->orderBy('name_en')->get(['id', 'code', 'name_en', 'name_km']);
        });

        return response()->json($districts);
    }

    public function communes(District $district)
    {
        $communes = Cache::rememberForever("locations:communes:{$district->id}", function () use ($district) {
            return $district->communes()->orderBy('name_en')->get(['id', 'code', 'name_en', 'name_km']);
        });

        return response()->json($communes);
    }
}
