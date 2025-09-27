<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $role = $this->faker->randomElement(['taxpayer', 'admin', 'auditor', 'accountant']);
        $tin = null;
        $phone = null;
        $address = null;
        $date_of_birth = null;
        $business_name = null;
        $business_type = null;

        if ($role === 'taxpayer') {
            $tin = 'TIN' . str_pad($this->faker->numberBetween(100000, 999999), 6, '0', STR_PAD_LEFT);
            $phone = $this->faker->phoneNumber();
            $address = $this->faker->address();
            $date_of_birth = $this->faker->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d');
            // 30% chance of having business details
            if ($this->faker->boolean(30)) {
                $business_name = $this->faker->company();
                $business_type = $this->faker->randomElement(['Technology', 'Manufacturing', 'Retail', 'Services', 'Healthcare', 'Education']);
            }
        }

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => $role,
            'tin' => $tin,
            'phone' => $phone,
            'address' => $address,
            'date_of_birth' => $date_of_birth,
            'business_name' => $business_name,
            'business_type' => $business_type,
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
