<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tax_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('return_number')->unique(); // Auto-generated return number
            $table->year('tax_year');
            $table->enum('return_type', ['individual', 'corporate', 'vat', 'amended']);
            $table->decimal('income_amount', 15, 2)->default(0);
            $table->decimal('deductions_amount', 15, 2)->default(0);
            $table->decimal('tax_due', 15, 2)->default(0);
            $table->decimal('tax_paid', 15, 2)->default(0);
            $table->decimal('refund_amount', 15, 2)->default(0);
            $table->enum('status', ['draft', 'filed', 'under_review', 'approved', 'rejected', 'amended'])->default('draft');
            $table->timestamp('filed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'tax_year']);
            $table->index(['status', 'filed_at']);
            $table->index(['return_type', 'tax_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tax_returns');
    }
};