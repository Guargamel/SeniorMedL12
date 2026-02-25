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
        'review_notes'
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the user who made the request (senior citizen)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the medicine being requested
     */
    public function medicine()
    {
        return $this->belongsTo(Medicine::class, 'medicine_id');
    }

    /**
     * Get the reviewer (staff or super-admin)
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved requests
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for declined requests
     */
    public function scopeDeclined($query)
    {
        return $query->where('status', 'declined');
    }

    protected $appends = ['prescription_url'];

    public function getPrescriptionUrlAttribute()
    {
        return $this->prescription_path
            ? asset('storage/' . $this->prescription_path)
            : null;
    }
}
