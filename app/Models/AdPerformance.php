<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdPerformance extends Model
{
    use HasFactory;

    protected $table = 'ad_performances';

    protected $fillable = [
        'date',
        'product_id',
        'vendor_id',
        'campaign_id',
        'keyword_id',
        'category_id',
        'impressions',
        'clicks',
        'orders',
        'unit_sold',
        'ctr',
        'cvr',
        'avg_ad_position',
        'sales_revenue',
        'total_ad_spend',
        'cpa',
        'cpc',
        'roas',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class, 'campaign_id');
    }

    public function keyword()
    {
        return $this->belongsTo(Keyword::class, 'keyword_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}

