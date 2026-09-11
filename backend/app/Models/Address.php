<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Address extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'user_id',
        'full_name',
        'telephone',
        'city_province',
        'district',
        'commune',
        'street',
        'label',
        'is_default',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
