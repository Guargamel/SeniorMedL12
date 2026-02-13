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
        /*************  ✨ Windsurf Command ⭐  *************/
        /**
     * Get the category that the medicine belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */

        /*******  0d8334da-e628-42fe-a18d-73e5fc8faabc  *******/
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
}
