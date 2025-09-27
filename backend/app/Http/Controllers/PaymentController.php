<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Display a listing of the payments.
     */
    public function index(Request $request)
    {
        $query = Payment::query();

        // Optional filters
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('payment_type')) {
            $query->where('payment_type', $request->string('payment_type'));
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->input('user_id'));
        }

        $payments = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'tax_return_id'    => 'nullable|exists:tax_returns,id',
            'payment_number'   => 'required|string|unique:payments,payment_number',
            'amount'           => 'required|numeric|min:0',
            'payment_type'     => 'nullable|in:tax_payment,penalty,interest,refund',
            'payment_method'   => 'required|string',
            'status'           => 'nullable|in:pending,processing,completed,failed,cancelled,refunded',
            'transaction_id'   => 'nullable|string',
            'reference_number' => 'nullable|string',
            'due_date'         => 'nullable|date',
            'paid_at'          => 'nullable|date',
            'notes'            => 'nullable|string',
            'payment_details'  => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Map frontend gateway to DB enum
        $gateway = strtolower($request->input('payment_method'));
        $methodMap = [
            'sslcommerz'    => 'credit_card',
            'stripe'        => 'credit_card',
            'bkash'         => 'bank_transfer',
            'bank_transfer' => 'bank_transfer',
            'credit_card'   => 'credit_card',
            'debit_card'    => 'debit_card',
            'cash'          => 'cash',
            'check'         => 'check',
        ];
        $mappedMethod = $methodMap[$gateway] ?? 'bank_transfer';

        $payment = Payment::create([
            'user_id'          => $user->id,
            'tax_return_id'    => $request->input('tax_return_id'),
            'payment_number'   => $request->input('payment_number'),
            'amount'           => $request->input('amount'),
            'payment_type'     => $request->input('payment_type', 'tax_payment'),
            'payment_method'   => $mappedMethod,
            'status'           => $request->input('status', 'completed'),
            'transaction_id'   => $request->input('transaction_id'),
            'reference_number' => $request->input('reference_number'),
            'due_date'         => $request->input('due_date'),
            'paid_at'          => $request->input('paid_at'),
            'notes'            => $request->input('notes'),
            'payment_details'  => $request->input('payment_details'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => $payment,
        ], 201);
    }
}
