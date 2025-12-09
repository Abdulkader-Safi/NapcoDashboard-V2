<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    public $incrementing = false; // varchar PK
    protected $keyType = 'string';
    protected $fillable = [
        'campaign_id',
        'campaign_name',
        'campaign_type',
        'campaign_start_date',
        'campaign_end_date',
    ];

    // Many-to-many relation with Keywords (for SEARCH campaigns)
    public function keywords()
    {
        return $this->belongsToMany(
            Keyword::class,
            'campaign_keywords',
            'campaign_id',
            'keyword_id'
        );
    }

    // Many-to-many relation with Categories (for LISTING campaigns)
    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'campaign_categories',
            'campaign_id',
            'category_id'
        );
    }

    // Relation with AdPerformance
    public function adPerformances()
    {
         return $this->hasMany(AdPerformance::class, 'campaign_id', 'campaign_id');
    }
}
