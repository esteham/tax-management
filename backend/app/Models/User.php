<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'tin',
        'phone',
        'address',
        'date_of_birth',
        'business_name',
        'business_type',
        'is_active',
        'email_verified_at',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * User roles enum
     */
    const ROLES = [
        'taxpayer' => 'Taxpayer',
        'admin' => 'Admin',
        'auditor' => 'Auditor',
        'accountant' => 'Accountant',
        'super_admin' => 'Super Admin',
    ];

    /**
     * Check if user has a specific role
     */
    public function hasRole($role)
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole($roles)
    {
        return in_array($this->role, (array) $roles);
    }

    /**
     * Check if user is admin or super admin
     */
    public function isAdmin()
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    /**
     * Get the user's full name with role
     */
    public function getDisplayNameAttribute()
    {
        return $this->name . ' (' . self::ROLES[$this->role] . ')';
    }

    /**
     * Relationships
     */
    public function taxReturns()
    {
        return $this->hasMany(TaxReturn::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function audits()
    {
        return $this->hasMany(Audit::class, 'taxpayer_id');
    }

    public function auditorsAssigned()
    {
        return $this->hasMany(Audit::class, 'auditor_id');
    }

    public function notices()
    {
        return $this->hasMany(Notice::class);
    }

    public function appeals()
    {
        return $this->hasMany(Appeal::class);
    }

    public function clientRelationships()
    {
        return $this->hasMany(ClientAccountant::class, 'accountant_id');
    }

    public function accountantRelationships()
    {
        return $this->hasMany(ClientAccountant::class, 'client_id');
    }

    /**
     * Scopes
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeTaxpayers($query)
    {
        return $query->where('role', 'taxpayer');
    }

    public function scopeAdmins($query)
    {
        return $query->whereIn('role', ['admin', 'super_admin']);
    }
}