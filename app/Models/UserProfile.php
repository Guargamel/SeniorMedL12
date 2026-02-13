<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'avatar',
        'phone',
        'address',
        'city',
        'state',
        'zip_code',
        'country',
        'date_of_birth',
        'bio',
        'department',
        'position',
        'hire_date',
        'emergency_contact_name',
        'emergency_contact_phone',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'hire_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        return $this->getDefaultAvatar();
    }

    public function getDefaultAvatar(): string
    {
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->user->name ?? 'User') . '&size=200&background=0B6E4F&color=fff';
    }
}
