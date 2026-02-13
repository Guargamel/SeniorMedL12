<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Models\SeniorProfile;
use App\Models\Distribution;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * Spatie permission uses the guard name to match roles/permissions.
     * Your SQL dump uses guard_name = 'web'.
     */
    protected string $guard_name = 'web';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'avatar',
        'phone',
        'address',
        'bio',
        'password',
    ];

    /**
     * Expose a convenient URL for the frontend.
     */
    protected $appends = ['avatar_url', 'initials'];

    public function getAvatarUrlAttribute(): ?string
    {
        if (empty($this->avatar)) {
            return null;
        }
        
        // Check if it's a full URL (external)
        if (filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            return $this->avatar;
        }
        
        // Local storage path
        return Storage::disk('public')->url($this->avatar);
    }

    public function getInitialsAttribute(): string
    {
        $words = explode(' ', $this->name);
        if (count($words) >= 2) {
            return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        }
        return strtoupper(substr($this->name, 0, 2));
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relationships
     */
    public function seniorProfile()
    {
        return $this->hasOne(SeniorProfile::class, 'user_id');
    }

    public function distributions()
    {
        return $this->hasMany(Distribution::class, 'user_id');
    }

    public function distributionsGiven()
    {
        return $this->hasMany(Distribution::class, 'distributed_by');
    }

    /**
     * Helper to get role display name
     */
    public function getRoleNameAttribute(): string
    {
        $role = $this->roles->first();
        if (!$role) return 'User';
        
        return str_replace('-', ' ', ucwords($role->name, '-'));
    }

    /**
     * Helper to get full profile data
     */
    public function getFullProfileAttribute(): array
    {
        $profile = [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'avatar_url' => $this->avatar_url,
            'initials' => $this->initials,
            'phone' => $this->phone,
            'address' => $this->address,
            'bio' => $this->bio,
            'role' => $this->role_name,
            'roles' => $this->roles->pluck('name'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];

        // Add senior profile data if exists
        if ($this->seniorProfile) {
            $profile['senior_profile'] = $this->seniorProfile;
        }

        // Add statistics
        $profile['stats'] = [
            'distributions_received' => $this->distributions()->count(),
            'distributions_given' => $this->distributionsGiven()->count(),
        ];

        return $profile;
    }
}
