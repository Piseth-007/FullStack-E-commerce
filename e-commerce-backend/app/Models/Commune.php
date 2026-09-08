<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commune extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'district_id', 'name_en', 'name_km'];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
