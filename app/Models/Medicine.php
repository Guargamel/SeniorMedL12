<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    protected $fillable = [
        'generic_name',
        'brand_name',
        'dosage_form',
        'strength',
        'category',
        'unit',
        'description',
        'is_active',
    ];

    public function category()
    {
        return $this->belongsTo(Medicine_Category::class);
    }
}
