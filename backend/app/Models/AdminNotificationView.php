<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotificationView extends Model
{
    protected $fillable = ['user_id', 'section', 'viewed_at'];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];
}
