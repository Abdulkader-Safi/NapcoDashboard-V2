<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $table = 'campaign_data'; // IMPORTANT

    protected $fillable = [
        'file_name',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];
}
