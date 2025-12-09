<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    public $incrementing = false; // varchar PK
    protected $keyType = 'string';

    protected $fillable = [
        'product_id',
        'product_name',
    ];

    // One-to-many: product → ad performance
    public function adPerformances()
    {
        return $this->hasMany(AdPerformance::class, 'product_id', 'product_id');
    }
}

