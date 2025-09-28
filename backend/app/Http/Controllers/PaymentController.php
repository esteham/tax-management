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
        $user = $request->user();

        // Check if user has permission to view payments
        if (!$user->hasAnyRole(['admin', 'super_admin', 'accountant'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view payments'
            ], 403);
        }

        $query = Payment::with(['user:id,name,email', 'taxReturn:id,return_number']);

        // Optional filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->user_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $payments = $query->latest()->paginate(15);

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

    /**
     * Download payment receipt/invoice.
     */
    public function downloadReceipt(Payment $payment)
    {
        $user = request()->user();

        // Check if user has permission to download this payment receipt
        if (!$user->hasAnyRole(['admin', 'super_admin', 'accountant']) && $payment->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to download this receipt'
            ], 403);
        }

        // Load related data
        $payment->load(['user:id,name,email', 'taxReturn:id,return_number,tax_year']);

        // Generate receipt content
        $receiptContent = $this->generateReceiptContent($payment);

        // Create filename
        $filename = "payment-receipt-{$payment->payment_number}.txt";

        return response()->streamDownload(function () use ($receiptContent) {
            echo $receiptContent;
        }, $filename, [
            'Content-Type' => 'text/plain',
        ]);
    }

    /**
     * Generate receipt content as text.
     */
    private function generateReceiptContent(Payment $payment)
    {
        $content = "PAYMENT RECEIPT\n";
        $content .= "================\n\n";
        $content .= "Payment Number: " . $payment->payment_number . "\n";
        $content .= "Date: " . $payment->created_at->format('Y-m-d H:i:s') . "\n";
        $content .= "Paid At: " . ($payment->paid_at ? $payment->paid_at->format('Y-m-d H:i:s') : 'N/A') . "\n\n";

        $content .= "Payer Details:\n";
        $content .= "--------------\n";
        $content .= "Name: " . $payment->user->name . "\n";
        $content .= "Email: " . $payment->user->email . "\n";
        $content .= "TIN: " . ($payment->user->tin ?? 'N/A') . "\n\n";

        $content .= "Payment Details:\n";
        $content .= "---------------\n";
        $content .= "Amount: $" . number_format($payment->amount, 2) . "\n";
        $content .= "Payment Type: " . ucfirst($payment->payment_type) . "\n";
        $content .= "Payment Method: " . ucfirst($payment->payment_method) . "\n";
        $content .= "Status: " . ucfirst($payment->status) . "\n";
        $content .= "Transaction ID: " . ($payment->transaction_id ?? 'N/A') . "\n";
        $content .= "Reference Number: " . ($payment->reference_number ?? 'N/A') . "\n\n";

        if ($payment->tax_return_id) {
            $content .= "Tax Return Details:\n";
            $content .= "------------------\n";
            $content .= "Return Number: " . $payment->taxReturn->return_number . "\n";
            $content .= "Tax Year: " . $payment->taxReturn->tax_year . "\n\n";
        }

        $content .= "Notes: " . ($payment->notes ?? 'No notes') . "\n\n";

        $content .= "Thank you for your payment!\n";
        $content .= "Tax Management System\n";

        return $content;
    }
}
