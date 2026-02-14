<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\User;  // Changed from App\Models\User to App\User
use App\Models\Medicine;

class Distribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'medicine_id',
        'quantity',
        'distribution_date',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
