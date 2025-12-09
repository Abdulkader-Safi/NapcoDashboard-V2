<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $primaryKey = 'category_id';
    protected $fillable = [
        'category_id',
        'category_name',
    ];

    public function campaigns()
    {
        return $this->belongsToMany(
            Campaign::class,
            'campaign_categories',
            'category_id',
            'campaign_id'
        );
    }
}
