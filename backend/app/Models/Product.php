<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'description',
        'price',
        'discount',
        'free_delivery',
        'stock',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
        'free_delivery' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function skinTypes()
    {
        return $this->belongsToMany(SkinType::class);
    }
}
