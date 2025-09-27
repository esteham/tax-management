<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TaxReturnController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\AppealController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('refresh', [AuthController::class, 'refresh']);
    });

    // User management routes
    Route::apiResource('users', UserController::class);
    Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword']);

    // Tax returns routes
    Route::apiResource('tax-returns', TaxReturnController::class);
    Route::post('tax-returns/{taxReturn}/submit', [TaxReturnController::class, 'submit']);
    Route::post('tax-returns/{taxReturn}/approve', [TaxReturnController::class, 'approve']);
    Route::post('tax-returns/{taxReturn}/reject', [TaxReturnController::class, 'reject']);

    // Payment routes
    Route::apiResource('payments', PaymentController::class);
    Route::post('payments/{payment}/process', [PaymentController::class, 'process']);
    Route::post('payments/{payment}/refund', [PaymentController::class, 'refund']);
    Route::get('payments/{payment}/receipt', [PaymentController::class, 'downloadReceipt']);

    // Audit routes
    Route::apiResource('audits', AuditController::class);
    Route::post('audits/{audit}/complete', [AuditController::class, 'complete']);
    Route::post('audits/{audit}/add-finding', [AuditController::class, 'addFinding']);

    // Notice routes
    Route::apiResource('notices', NoticeController::class);
    Route::post('notices/{notice}/mark-read', [NoticeController::class, 'markAsRead']);
    Route::post('notices/bulk-send', [NoticeController::class, 'bulkSend']);

    // Appeal routes
    Route::apiResource('appeals', AppealController::class);
    Route::post('appeals/{appeal}/respond', [AppealController::class, 'respond']);
    Route::post('appeals/{appeal}/close', [AppealController::class, 'close']);

    // File management routes
    Route::prefix('files')->group(function () {
        Route::post('upload', [FileController::class, 'upload']);
        Route::get('{file}/download', [FileController::class, 'download']);
        Route::delete('{file}', [FileController::class, 'delete']);
    });

    // Report routes
    Route::prefix('reports')->group(function () {
        Route::get('dashboard-stats', [ReportController::class, 'dashboardStats']);
        Route::get('revenue', [ReportController::class, 'revenueReport']);
        Route::get('compliance', [ReportController::class, 'complianceReport']);
        Route::get('taxpayer-activity', [ReportController::class, 'taxpayerActivityReport']);
        Route::get('audit-summary', [ReportController::class, 'auditSummaryReport']);
        Route::post('export', [ReportController::class, 'exportReport']);
    });

    // Admin only routes
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::prefix('admin')->group(function () {
            Route::get('system-stats', [ReportController::class, 'systemStats']);
            Route::post('bulk-operations', [UserController::class, 'bulkOperations']);
            Route::get('audit-logs', [ReportController::class, 'auditLogs']);
        });
    });

    // Super admin only routes
    Route::middleware('role:super_admin')->group(function () {
        Route::prefix('super-admin')->group(function () {
            Route::get('system-config', [AdminController::class, 'getSystemConfig']);
            Route::post('system-config', [AdminController::class, 'updateSystemConfig']);
            Route::get('database-stats', [AdminController::class, 'getDatabaseStats']);
            Route::post('maintenance-mode', [AdminController::class, 'toggleMaintenanceMode']);
        });
    });
});

// Fallback route for API
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found'
    ], 404);
});