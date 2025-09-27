<?php

namespace Database\Seeders;

use App\Models\TaxReturn;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaxReturnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $taxpayers = User::where('role', 'taxpayer')->get();

        foreach ($taxpayers as $taxpayer) {
            // Create 1-3 tax returns per taxpayer
            $numReturns = rand(1, 3);

            for ($i = 0; $i < $numReturns; $i++) {
                $taxYear = now()->year - rand(0, 2);
                $incomeAmount = rand(50000, 500000);
                $deductionsAmount = rand(0, $incomeAmount * 0.3);
                $taxDue = ($incomeAmount - $deductionsAmount) * 0.25; // Simplified tax calculation
                $taxPaid = rand(0, 1) ? $taxDue : $taxDue * rand(50, 100) / 100; // Sometimes partially paid

                $status = fake()->randomElement(['draft', 'filed', 'under_review', 'approved', 'rejected']);
                $filedAt = in_array($status, ['filed', 'under_review', 'approved', 'rejected']) ? now()->subDays(rand(1, 365)) : null;
                $approvedAt = $status === 'approved' ? $filedAt->copy()->addDays(rand(1, 30)) : null;
                $rejectedAt = $status === 'rejected' ? $filedAt->copy()->addDays(rand(1, 30)) : null;

                TaxReturn::create([
                    'user_id' => $taxpayer->id,
                    'return_number' => 'RTN' . str_pad(TaxReturn::count() + 1, 6, '0', STR_PAD_LEFT),
                    'tax_year' => $taxYear,
                    'return_type' => $taxpayer->business_name ? 'corporate' : 'individual',
                    'income_amount' => $incomeAmount,
                    'deductions_amount' => $deductionsAmount,
                    'tax_due' => $taxDue,
                    'tax_paid' => $taxPaid,
                    'refund_amount' => max(0, $taxPaid - $taxDue),
                    'status' => $status,
                    'filed_at' => $filedAt,
                    'approved_at' => $approvedAt,
                    'rejected_at' => $rejectedAt,
                    'rejection_reason' => $status === 'rejected' ? 'Incomplete documentation' : null,
                    'notes' => fake()->sentence(),
                ]);
            }
        }
    }
}
