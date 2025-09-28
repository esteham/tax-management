<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $audits = Audit::with(['taxReturn', 'user'])->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $audits
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tax_return_id' => 'required|exists:tax_returns,id',
            'user_id' => 'required|exists:users,id',
            'status' => 'required|in:pending,in_progress,completed',
            'findings' => 'nullable|array',
            'recommendations' => 'nullable|string',
        ]);

        $audit = Audit::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Audit created successfully',
            'data' => $audit->load(['taxReturn', 'user'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Audit $audit)
    {
        $audit->load(['taxReturn', 'user', 'findings']);

        return response()->json([
            'success' => true,
            'data' => $audit
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Audit $audit)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,in_progress,completed',
            'findings' => 'nullable|array',
            'recommendations' => 'nullable|string',
        ]);

        $audit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Audit updated successfully',
            'data' => $audit->load(['taxReturn', 'user'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Audit $audit)
    {
        $audit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Audit deleted successfully'
        ]);
    }

    /**
     * Complete an audit.
     */
    public function complete(Request $request, Audit $audit)
    {
        $audit->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Audit completed successfully',
            'data' => $audit->fresh()
        ]);
    }

    /**
     * Add a finding to an audit.
     */
    public function addFinding(Request $request, Audit $audit)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'severity' => 'required|in:low,medium,high',
            'category' => 'required|string',
        ]);

        $finding = $audit->findings()->create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Finding added successfully',
            'data' => $finding
        ]);
    }
}
