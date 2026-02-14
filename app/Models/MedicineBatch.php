<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicineBatch extends Model
{
    protected $fillable = [
        'medicine_id',
        'batch_no',
        'expiry_date',
        'quantity',
        'received_at',
        'supplier',
        'cost',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'received_at' => 'date',
    ];

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class); // Define the relationship to the Supplier model
    }
}
