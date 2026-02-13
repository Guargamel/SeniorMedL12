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
        'category_id',
        'unit',
        'description',
        'is_active',
        'picture',
    ];

    public function category()
    {
        return $this->belongsTo(Medicine_Category::class, 'category_id');
    }

    public function batches()
    {
        return $this->hasMany(Medicine_Batches::class, 'medicine_id');
    }
}
