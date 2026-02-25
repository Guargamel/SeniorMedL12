<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SeniorProfile extends Model
{
    protected $table = 'senior_profiles';

    protected $fillable = [
        'user_id',
        'birthdate',
        'sex',
        'contact_no',
        'barangay',
        'address',
        'notes',
        'weight_kilos',
        'height_cm',
        'age',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
        'blood_type_id',
    ];

    protected $appends = ['age'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bloodType()
    {
        return $this->belongsTo(BloodType::class, 'blood_type_id');
    }
    public function getAgeAttribute()
    {
        return Carbon::parse($this->birthday)->age;
    }
}
