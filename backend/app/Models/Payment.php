<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tax_return_id',
        'payment_number',
        'amount',
        'payment_type',
        'payment_method',
        'status',
        'transaction_id',
        'reference_number',
        'due_date',
        'paid_at',
        'notes',
        'payment_details',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
        'due_date' => 'datetime',
        'paid_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function taxReturn()
    {
        return $this->belongsTo(TaxReturn::class);
    }
}
