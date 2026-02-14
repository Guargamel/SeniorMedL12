<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    protected $table = 'medicines';

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

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(MedicineCategory::class, 'category_id');
    }

    // If you have medicine_batches table
    public function batches()
    {
        return $this->hasMany(MedicineBatch::class, 'medicine_id');
    }

    // In the MedicineBatch model
    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
