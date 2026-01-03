<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'isbn','title','author','description','cover_url','publish_year','language','pages',
        'price','is_digital','file_path','available_copies','total_copies','created_by',
    ];

    protected $casts = [
        'is_digital' => 'boolean',
        'price' => 'decimal:2',
        'publish_year' => 'integer',
        'pages' => 'integer',
        'available_copies' => 'integer',
        'total_copies' => 'integer',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'book_category');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }
}
