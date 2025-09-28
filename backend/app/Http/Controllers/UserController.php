<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with(['taxReturns', 'payments'])
            ->when(request('role'), function ($query, $role) {
                return $query->where('role', $role);
            })
            ->when(request('search'), function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(array_keys(User::ROLES))],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'business_name' => 'nullable|string|max:255',
            'business_type' => 'nullable|string',
            'tin' => 'nullable|string|max:50|unique:users',
            'is_active' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user->load(['taxReturns', 'payments'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load(['taxReturns', 'payments', 'notices']);
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Get full user profile for the authenticated user.
     */
    public function profile()
    {
        $user = Auth::user()->load(['taxReturns', 'payments', 'notices']);

        // Auto-assign TIN if user doesn't have one
        if (!$user->tin) {
            $user->tin = 'TIN' . str_pad($user->id, 6, '0', STR_PAD_LEFT);
            $user->save();
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8|confirmed',
            'role' => ['sometimes', Rule::in(array_keys(User::ROLES))],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'date_of_birth' => 'nullable|date',
            'business_name' => 'nullable|string|max:255',
            'business_type' => 'nullable|string',
            'tin' => ['nullable', 'string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'is_active' => 'boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->load(['taxReturns', 'payments'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Toggle user status (active/inactive).
     */
    public function toggleStatus(User $user)
    {
        $this->authorize('update', $user);

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user->fresh()
        ]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(User $user)
    {
        $this->authorize('update', $user);

        $password = 'password123'; // In production, generate secure random password
        $user->update([
            'password' => Hash::make($password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully',
            'data' => [
                'new_password' => $password,
                'user' => $user->fresh()
            ]
        ]);
    }

    /**
     * Perform bulk operations on users.
     */
    public function bulkOperations(Request $request)
    {
        $this->authorize('update', User::class);

        $validated = $request->validate([
            'user_ids' => 'required|array',
            'action' => 'required|in:activate,deactivate,delete,reset_password',
        ]);

        $users = User::whereIn('id', $validated['user_ids'])->get();

        foreach ($users as $user) {
            switch ($validated['action']) {
                case 'activate':
                    $user->update(['is_active' => true]);
                    break;
                case 'deactivate':
                    $user->update(['is_active' => false]);
                    break;
                case 'delete':
                    $user->delete();
                    break;
                case 'reset_password':
                    $password = 'password123';
                    $user->update(['password' => Hash::make($password)]);
                    break;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Bulk operation completed for {$users->count()} users"
        ]);
    }
}
