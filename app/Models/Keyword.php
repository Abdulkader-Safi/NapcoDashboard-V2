<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Keyword extends Model
{
    use HasFactory;

    protected $primaryKey = 'keyword_id';
    protected $fillable = [
        'keyword'
    ];

    // Relation with SEARCH campaigns (many-to-many)
    public function campaigns()
    {
        return $this->belongsToMany(
            Campaign::class,
            'campaign_keywords',
            'keyword_id',
            'campaign_id'
        );
    }

    // Relation with ad performance
    public function adPerformances()
    {
        return $this->hasMany(AdPerformance::class, 'keyword_id');
    }
}
