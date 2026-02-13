<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine_Batches extends Model
{
    protected $fillable = [
        'medicine_id',
        'expiry_date',
        'qty_received',
        'qty_remaining',
        'created_at',
        'updated_at',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicines::class);
    }
}
