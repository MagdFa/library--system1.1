<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function myReservations(Request $request)
    {
        $reservations = Reservation::query()
            ->where('user_id', $request->user()->id)
            ->with('book.categories')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($reservations);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'book_id' => ['required','integer','exists:books,id'],
        ]);

        $userId = $request->user()->id;
        $book = Book::findOrFail($data['book_id']);

        if ($book->available_copies <= 0) {
            return response()->json(['message' => 'No copies available for reservation.'], 409);
        }

        $already = Reservation::query()
            ->where('user_id', $userId)
            ->where('book_id', $book->id)
            ->whereIn('status', ['pending','approved'])
            ->exists();

        if ($already) {
            return response()->json(['message' => 'You already have an active reservation for this book.'], 409);
        }

        $reservation = Reservation::create([
            'user_id' => $userId,
            'book_id' => $book->id,
            'status' => 'pending',
            'reserved_until' => now()->addDays(2),
        ]);

        return response()->json($reservation->load('book.categories'), 201);
    }

    public function cancel(Request $request, Reservation $reservation)
    {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!in_array($reservation->status, ['pending','approved'], true)) {
            return response()->json(['message' => 'Cannot cancel this reservation.'], 400);
        }

        $reservation->status = 'cancelled';
        $reservation->save();

        return response()->json(['message' => 'Reservation cancelled.']);
    }
}
