<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\TaxReturn;
use App\Models\User;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $taxReturns = TaxReturn::all();

        foreach ($taxReturns as $taxReturn) {
            // Create 0-2 payments per tax return
            $numPayments = rand(0, 2);

            for ($i = 0; $i < $numPayments; $i++) {
                $amount = rand(1000, $taxReturn->tax_due);
                $status = fake()->randomElement(['pending', 'processing', 'completed', 'failed', 'refunded']);
                $paidAt = in_array($status, ['completed', 'refunded']) ? now()->subDays(rand(1, 365)) : null;

                Payment::create([
                    'user_id' => $taxReturn->user_id,
                    'tax_return_id' => $taxReturn->id,
                    'payment_number' => 'PAY' . str_pad(Payment::count() + 1, 6, '0', STR_PAD_LEFT),
                    'amount' => $amount,
                    'payment_type' => 'tax_payment',
                    'payment_method' => fake()->randomElement(['bank_transfer', 'credit_card', 'debit_card', 'cash', 'check']),
                    'status' => $status,
                    'transaction_id' => 'TXN' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT),
                    'reference_number' => 'REF' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT),
                    'due_date' => now()->addDays(rand(1, 365)),
                    'paid_at' => $paidAt,
                    'notes' => fake()->sentence(),
                    'payment_details' => [
                        'bank_name' => fake()->company(),
                        'account_number' => fake()->bankAccountNumber(),
                    ],
                ]);
            }
        }

        // Also create some standalone payments for users without tax returns
        $usersWithoutReturns = User::where('role', 'taxpayer')
            ->whereDoesntHave('taxReturns')
            ->get();

        foreach ($usersWithoutReturns as $user) {
            $numPayments = rand(1, 3);

            for ($i = 0; $i < $numPayments; $i++) {
                $amount = rand(5000, 50000);
                $status = fake()->randomElement(['pending', 'processing', 'completed', 'failed']);
                $paidAt = $status === 'completed' ? now()->subDays(rand(1, 365)) : null;

                Payment::create([
                    'user_id' => $user->id,
                    'payment_number' => 'PAY' . str_pad(Payment::count() + 1, 6, '0', STR_PAD_LEFT),
                    'amount' => $amount,
                    'payment_type' => 'tax_payment',
                    'payment_method' => fake()->randomElement(['bank_transfer', 'credit_card', 'debit_card', 'cash', 'check']),
                    'status' => $status,
                    'transaction_id' => 'TXN' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT),
                    'reference_number' => 'REF' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT),
                    'due_date' => now()->addDays(rand(1, 365)),
                    'paid_at' => $paidAt,
                    'notes' => fake()->sentence(),
                    'payment_details' => [
                        'bank_name' => fake()->company(),
                        'account_number' => fake()->bankAccountNumber(),
                    ],
                ]);
            }
        }
    }
}
