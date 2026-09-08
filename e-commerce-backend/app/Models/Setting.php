<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['group', 'key', 'value'];

    protected $casts = [
        'value' => 'json',
    ];

    public static function getGroup(string $group): array
    {
        return static::where('group', $group)->pluck('value', 'key')->toArray();
    }

    public static function putGroup(string $group, array $data): array
    {
        foreach ($data as $key => $value) {
            static::updateOrCreate(
                ['group' => $group, 'key' => $key],
                ['value' => $value]
            );
        }

        return static::getGroup($group);
    }
}
