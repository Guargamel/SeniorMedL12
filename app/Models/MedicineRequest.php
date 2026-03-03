<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicineRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'medicine_id',
        'quantity',
        'reason',
        'status',
        'prescription_path',
        'reviewed_by',
        'reviewed_at',
        'notes',        // ✅ admin reason (TEXT column)
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    protected $appends = ['prescription_url'];

    public function getPrescriptionUrlAttribute()
    {
        return $this->prescription_path
            ? asset('storage/' . $this->prescription_path)
            : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeDeclined($query)
    {
        return $query->where('status', 'declined');
    }
}
