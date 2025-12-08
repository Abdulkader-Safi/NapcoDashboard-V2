<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $primaryKey = 'vendor_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'vendor_id',
        'vendor_name',
    ];

    // One-to-many with AdPerformance
    public function adPerformances()
    {
        return $this->hasMany(AdPerformance::class, 'vendor_id');
    }
}

