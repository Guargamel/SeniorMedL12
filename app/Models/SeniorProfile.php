<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeniorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'birthdate',
        'sex',
        'contact_no',
        'barangay',
        'address',
        'notes'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
