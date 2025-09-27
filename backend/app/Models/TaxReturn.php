<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxReturn extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'return_number',
        'tax_year',
        'return_type',
        'income_amount',
        'deductions_amount',
        'tax_due',
        'tax_paid',
        'refund_amount',
        'status',
        'filed_at',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'income_amount' => 'decimal:2',
        'deductions_amount' => 'decimal:2',
        'tax_due' => 'decimal:2',
        'tax_paid' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'filed_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Return types enum
     */
    const RETURN_TYPES = [
        'individual' => 'Individual Income Tax',
        'corporate' => 'Corporate Income Tax',
        'vat' => 'VAT Return',
        'amended' => 'Amended Return',
    ];

    /**
     * Status enum
     */
    const STATUSES = [
        'draft' => 'Draft',
        'filed' => 'Filed',
        'under_review' => 'Under Review',
        'approved' => 'Approved',
        'rejected' => 'Rejected',
        'amended' => 'Amended',
    ];

    /**
     * Get the return type display name
     */
    public function getReturnTypeDisplayAttribute()
    {
        return self::RETURN_TYPES[$this->return_type] ?? $this->return_type;
    }

    /**
     * Get the status display name
     */
    public function getStatusDisplayAttribute()
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    /**
     * Check if return can be edited
     */
    public function canEdit()
    {
        return in_array($this->status, ['draft', 'rejected']);
    }

    /**
     * Check if return is filed
     */
    public function isFiled()
    {
        return !in_array($this->status, ['draft']);
    }

    /**
     * Calculate balance due
     */
    public function getBalanceDueAttribute()
    {
        return max(0, $this->tax_due - $this->tax_paid);
    }

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->hasMany(TaxDocument::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function audits()
    {
        return $this->hasMany(Audit::class);
    }

    public function appeals()
    {
        return $this->hasMany(Appeal::class);
    }

    /**
     * Scopes
     */
    public function scopeByYear($query, $year)
    {
        return $query->where('tax_year', $year);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('return_type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeFiled($query)
    {
        return $query->whereNotNull('filed_at');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopePendingReview($query)
    {
        return $query->whereIn('status', ['filed', 'under_review']);
    }
}