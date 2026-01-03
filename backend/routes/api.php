<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Admin\UserAdminController;
use App\Http\Controllers\Api\Librarian\LibrarianController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Public endpoints are accessible without authentication.
| Protected endpoints use Sanctum token auth.
*/

Route::get('/ping', fn () => ['ok' => true]);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// Public catalog
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{book}', [BookController::class, 'show']);

// Protected (any authenticated role)
Route::middleware('auth:sanctum')->group(function () {
    // Reservations
    Route::get('/reservations', [ReservationController::class, 'myReservations']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'cancel']);

    // Loans
    Route::get('/loans', [LoanController::class, 'myLoans']);

    // Digital reading
    Route::post('/books/{book}/read', [BookController::class, 'openReadingSession']);
    Route::get('/books/{book}/download', [BookController::class, 'download']);

    // Orders + payments
    Route::get('/orders', [OrderController::class, 'myOrders']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/payments/checkout', [PaymentController::class, 'checkout']);
});

// Librarian/admin role protected
Route::middleware(['auth:sanctum', 'role:librarian,admin'])->prefix('librarian')->group(function () {
    Route::get('/reservations/pending', [LibrarianController::class, 'pendingReservations']);
    Route::post('/reservations/{reservation}/approve', [LibrarianController::class, 'approveReservation']);

    Route::get('/loans/active', [LibrarianController::class, 'activeLoans']);
    Route::post('/loans/issue', [LibrarianController::class, 'issueLoan']);
    Route::post('/loans/{loan}/return', [LibrarianController::class, 'returnLoan']);

    Route::post('/books', [LibrarianController::class, 'storeBook']);
    Route::put('/books/{book}', [LibrarianController::class, 'updateBook']);
    Route::delete('/books/{book}', [LibrarianController::class, 'deleteBook']);
    Route::post('/books/{book}/upload', [LibrarianController::class, 'uploadEbook']);
});

// Admin only
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/users', [UserAdminController::class, 'index']);
    Route::post('/users', [UserAdminController::class, 'store']);
    Route::put('/users/{user}', [UserAdminController::class, 'update']);
    Route::delete('/users/{user}', [UserAdminController::class, 'destroy']);
});
