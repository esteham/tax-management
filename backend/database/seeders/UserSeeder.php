<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin
        User::create([
            'name' => 'Super Administrator',
            'email' => 'superadmin@taxpro.com',
            'password' => Hash::make('admin123'),
            'role' => 'super_admin',
            'tin' => 'SUPER001',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create Admin
        User::create([
            'name' => 'Tax Administrator',
            'email' => 'admin@taxpro.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'tin' => 'ADMIN001',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create Auditor
        User::create([
            'name' => 'Tax Auditor',
            'email' => 'auditor@taxpro.com',
            'password' => Hash::make('auditor123'),
            'role' => 'auditor',
            'tin' => 'AUDIT001',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create Accountant
        User::create([
            'name' => 'Tax Accountant',
            'email' => 'accountant@taxpro.com',
            'password' => Hash::make('accountant123'),
            'role' => 'accountant',
            'tin' => 'ACCT001',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create Demo Taxpayers
        $taxpayers = [
            [
                'name' => 'John Smith',
                'email' => 'taxpayer@demo.com',
                'tin' => 'TIN123456',
                'phone' => '+1234567890',
                'address' => '123 Main Street, Cityville, State 12345',
                'date_of_birth' => '1985-06-15',
            ],
            [
                'name' => 'ABC Corporation',
                'email' => 'admin@abccorp.com',
                'tin' => 'TIN789012',
                'phone' => '+1987654321',
                'address' => '456 Business Ave, Corporate City, State 54321',
                'business_name' => 'ABC Corporation',
                'business_type' => 'Technology',
            ],
            [
                'name' => 'Jane Doe',
                'email' => 'jane.doe@example.com',
                'tin' => 'TIN345678',
                'phone' => '+1555123456',
                'address' => '789 Residential St, Hometown, State 67890',
                'date_of_birth' => '1990-03-22',
            ],
            [
                'name' => 'XYZ Limited',
                'email' => 'contact@xyzltd.com',
                'tin' => 'TIN901234',
                'phone' => '+1444987654',
                'address' => '321 Commerce Blvd, Business District, State 13579',
                'business_name' => 'XYZ Limited',
                'business_type' => 'Manufacturing',
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'tin' => 'TIN567890',
                'phone' => '+1666555444',
                'address' => '654 Suburban Lane, Quiet Town, State 24680',
                'date_of_birth' => '1988-11-08',
            ],
        ];

        foreach ($taxpayers as $taxpayerData) {
            User::create(array_merge($taxpayerData, [
                'password' => Hash::make('taxpayer123'),
                'role' => 'taxpayer',
                'is_active' => true,
                'email_verified_at' => now(),
            ]));
        }

        // Create additional demo users using factory if needed
        User::factory(20)->create([
            'role' => 'taxpayer',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}