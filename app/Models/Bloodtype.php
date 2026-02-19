<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BloodType extends Model
{
    protected $table = 'blood_types';

    protected $fillable = [
        'type',
        'description',
    ];

    /**
     * One blood type can belong to many seniors
     */
    public function seniorProfiles(): HasMany
    {
        return $this->hasMany(SeniorProfile::class, 'blood_type_id');
    }
}
