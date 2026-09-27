<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'slug', 'logo_url', 'logo_public_id'];

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function resolveRouteBindingQuery($query, $value, $field = null)
    {
        $field = $field ?? $this->getRouteKeyName();

        if ($field === 'slug') {
            if (is_numeric($value)) {
                return $query->where('id', $value)->orWhere('slug', $value);
            }
            return $query->where('slug', $value);
        }

        return parent::resolveRouteBindingQuery($query, $value, $field);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
