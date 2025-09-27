<?php

namespace App\Http\Controllers;

use App\Models\TaxReturn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class TaxReturnController extends Controller
{
    /**
     * Display a listing of tax returns
     */
    public function index(Request $request)
    {
        $query = TaxReturn::with(['user', 'documents']);

        // Role-based filtering
        if ($request->user()->role === 'taxpayer') {
            $query->where('user_id', $request->user()->id);
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('year')) {
            $query->where('tax_year', $request->year);
        }

        if ($request->has('type')) {
            $query->where('return_type', $request->type);
        }

        // Apply search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('return_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $taxReturns = $query->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $taxReturns
        ]);
    }

    /**
     * Store a newly created tax return
     */
    public function store(Request $request)
    {

        $user = $request->user();
        if (!$user) 
        {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'tax_year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'return_type' => 'required|in:individual,corporate,vat,amended',
            'income_amount' => 'required|numeric|min:0',
            'tax_due' => 'required|numeric|min:0',
            'documents' => 'array',
            'documents.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $taxReturn = TaxReturn::create([
            'user_id' => $user->id,
            'return_number' => $this->generateReturnNumber(),
            'tax_year' => $request->tax_year,
            'return_type' => $request->return_type,
            'income_amount' => $request->income_amount,
            'tax_due' => $request->tax_due,
            'status' => 'draft',
            'filed_at' => null,
        ]);

        // Handle document uploads
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $path = $file->store('tax-returns/' . $taxReturn->id, 'public');
                
                $taxReturn->documents()->create([
                    'filename' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Tax return created successfully',
            'data' => $taxReturn->load(['user', 'documents'])
        ], 201);
    }

    /**
     * Display the specified tax return
     */
    public function show(Request $request, TaxReturn $taxReturn)
    {
        // Check if user can access this tax return
        if ($request->user()->role === 'taxpayer' && $taxReturn->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $taxReturn->load(['user', 'documents', 'payments', 'audits'])
        ]);
    }

    /**
     * Update the specified tax return
     */
    public function update(Request $request, TaxReturn $taxReturn)
    {
        // Check if user can update this tax return
        if ($request->user()->role === 'taxpayer' && $taxReturn->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Prevent updates to filed returns (unless admin)
        if ($taxReturn->status === 'filed' && !in_array($request->user()->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update filed tax return'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'income_amount' => 'sometimes|numeric|min:0',
            'tax_due' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:draft,filed,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $taxReturn->update($request->only([
            'income_amount',
            'tax_due',
            'status'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Tax return updated successfully',
            'data' => $taxReturn->load(['user', 'documents'])
        ]);
    }

    /**
     * Submit tax return for processing
     */
    public function submit(Request $request, TaxReturn $taxReturn)
    {
        // Check if user can submit this tax return
        if ($request->user()->role === 'taxpayer' && $taxReturn->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        if ($taxReturn->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft returns can be submitted'
            ], 422);
        }

        $taxReturn->update([
            'status' => 'filed',
            'filed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tax return submitted successfully',
            'data' => $taxReturn
        ]);
    }

    /**
     * Remove the specified tax return
     */
    public function destroy(Request $request, TaxReturn $taxReturn)
    {
        // Only allow deletion of draft returns
        if ($taxReturn->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft returns can be deleted'
            ], 422);
        }

        // Check permissions
        if ($request->user()->role === 'taxpayer' && $taxReturn->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Delete associated documents
        foreach ($taxReturn->documents as $document) {
            Storage::disk('public')->delete($document->file_path);
            $document->delete();
        }

        $taxReturn->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tax return deleted successfully'
        ]);
    }

    /**
     * Generate unique return number
     */
    private function generateReturnNumber()
    {
        $year = date('Y');
        $lastReturn = TaxReturn::whereYear('created_at', $year)
                             ->orderBy('id', 'desc')
                             ->first();
        
        $sequence = $lastReturn ? 
            (int) substr($lastReturn->return_number, -4) + 1 : 
            1;

        return $year . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }
}