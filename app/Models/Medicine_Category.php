<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine_Category extends Model
{
    protected $fillable = [
        'name',
    ];

    public function medicines()
    {
        return $this->hasMany(Medicine::class, 'category_id');
    }
}
