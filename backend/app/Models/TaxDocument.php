<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'tax_return_id',
        'filename',
        'file_path',
        'file_size',
        'mime_type',
    ];

    public function taxReturn()
    {
        return $this->belongsTo(TaxReturn::class);
    }
}
