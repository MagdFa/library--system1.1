<?php

namespace App\Http\Controllers\Api\Librarian;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Loan;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LibrarianController extends Controller
{
    public function pendingReservations()
    {
        $reservations = Reservation::query()
            ->where('status', 'pending')
            ->with(['book.categories','user:id,name,email,role'])
            ->orderBy('id')
            ->paginate(25);

        return response()->json($reservations);
    }

    public function approveReservation(Request $request, Reservation $reservation)
    {
        if ($reservation->status !== 'pending') {
            return response()->json(['message' => 'Reservation is not pending.'], 400);
        }

        $loan = DB::transaction(function () use ($request, $reservation) {
            $book = Book::lockForUpdate()->findOrFail($reservation->book_id);

            if ($book->available_copies <= 0) {
                return null;
            }

            $book->available_copies -= 1;
            $book->save();

            $reservation->status = 'fulfilled';
            $reservation->save();

            return Loan::create([
                'user_id' => $reservation->user_id,
                'book_id' => $reservation->book_id,
                'status' => 'active',
                'borrowed_at' => now(),
                'due_at' => now()->addDays(14),
                'processed_by' => $request->user()->id,
            ]);
        });

        if (!$loan) {
            return response()->json(['message' => 'No copies available.'], 409);
        }

        return response()->json($loan->load('book.categories','user:id,name,email,role'), 201);
    }

    public function activeLoans()
    {
        $loans = Loan::query()
            ->where('status', 'active')
            ->with(['book.categories','user:id,name,email,role'])
            ->orderByDesc('id')
            ->paginate(25);

        return response()->json($loans);
    }

    public function issueLoan(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required','integer','exists:users,id'],
            'book_id' => ['required','integer','exists:books,id'],
        ]);

        $loan = DB::transaction(function () use ($request, $data) {
            $book = Book::lockForUpdate()->findOrFail($data['book_id']);

            if ($book->available_copies <= 0) {
                return null;
            }

            $book->available_copies -= 1;
            $book->save();

            return Loan::create([
                'user_id' => $data['user_id'],
                'book_id' => $data['book_id'],
                'status' => 'active',
                'borrowed_at' => now(),
                'due_at' => now()->addDays(14),
                'processed_by' => $request->user()->id,
            ]);
        });

        if (!$loan) {
            return response()->json(['message' => 'No copies available.'], 409);
        }

        return response()->json($loan->load('book.categories','user:id,name,email,role'), 201);
    }

    public function returnLoan(Request $request, Loan $loan)
    {
        if ($loan->status !== 'active') {
            return response()->json(['message' => 'Loan is not active.'], 400);
        }

        DB::transaction(function () use ($loan) {
            $book = Book::lockForUpdate()->findOrFail($loan->book_id);
            $book->available_copies += 1;
            if ($book->available_copies > $book->total_copies) {
                $book->available_copies = $book->total_copies;
            }
            $book->save();

            $loan->status = 'returned';
            $loan->returned_at = now();
            $loan->save();
        });

        return response()->json(['message' => 'Loan returned.']);
    }

    // ------------------ Books management ------------------

    public function storeBook(Request $request)
    {
        $data = $request->validate([
            'isbn' => ['nullable','string','max:50'],
            'title' => ['required','string','max:255'],
            'author' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'cover_url' => ['nullable','url'],
            'publish_year' => ['nullable','integer','min:0','max:3000'],
            'language' => ['nullable','string','max:50'],
            'pages' => ['nullable','integer','min:1'],
            'price' => ['nullable','numeric','min:0'],
            'is_digital' => ['required','boolean'],
            'total_copies' => ['required','integer','min:0'],
            'category_ids' => ['nullable','array'],
            'category_ids.*' => ['integer','exists:categories,id'],
        ]);

        $book = Book::create([
            'isbn' => $data['isbn'] ?? null,
            'title' => $data['title'],
            'author' => $data['author'],
            'description' => $data['description'] ?? null,
            'cover_url' => $data['cover_url'] ?? null,
            'publish_year' => $data['publish_year'] ?? null,
            'language' => $data['language'] ?? null,
            'pages' => $data['pages'] ?? null,
            'price' => $data['price'] ?? 0,
            'is_digital' => (bool)$data['is_digital'],
            'total_copies' => $data['total_copies'],
            'available_copies' => $data['total_copies'],
            'created_by' => $request->user()->id,
        ]);

        if (!empty($data['category_ids'])) {
            $book->categories()->sync($data['category_ids']);
        }

        return response()->json($book->load('categories'), 201);
    }

    public function updateBook(Request $request, Book $book)
    {
        $data = $request->validate([
            'isbn' => ['nullable','string','max:50'],
            'title' => ['sometimes','string','max:255'],
            'author' => ['sometimes','string','max:255'],
            'description' => ['nullable','string'],
            'cover_url' => ['nullable','url'],
            'publish_year' => ['nullable','integer','min:0','max:3000'],
            'language' => ['nullable','string','max:50'],
            'pages' => ['nullable','integer','min:1'],
            'price' => ['nullable','numeric','min:0'],
            'is_digital' => ['sometimes','boolean'],
            'total_copies' => ['nullable','integer','min:0'],
            'category_ids' => ['nullable','array'],
            'category_ids.*' => ['integer','exists:categories,id'],
        ]);

        DB::transaction(function () use ($book, $data) {
            if (array_key_exists('total_copies', $data) && $data['total_copies'] !== null) {
                $delta = (int)$data['total_copies'] - (int)$book->total_copies;
                $book->total_copies = (int)$data['total_copies'];
                $book->available_copies = max(0, (int)$book->available_copies + $delta);
            }

            $book->fill(collect($data)->except(['category_ids','total_copies'])->toArray());
            $book->save();

            if (array_key_exists('category_ids', $data)) {
                $book->categories()->sync($data['category_ids'] ?? []);
            }
        });

        return response()->json($book->fresh()->load('categories'));
    }

    public function deleteBook(Book $book)
    {
        $book->categories()->detach();
        $book->delete();
        return response()->json(['message' => 'Book deleted']);
    }

    public function uploadEbook(Request $request, Book $book)
    {
        if (!$book->is_digital) {
            return response()->json(['message' => 'Book must be digital to upload an ebook file.'], 400);
        }

        $data = $request->validate([
            'file' => ['required','file','mimes:pdf','max:51200'], // 50MB
        ]);

        $file = $data['file'];
        $dir = 'ebooks';
        $filename = 'book_' . $book->id . '.pdf';
        $path = $file->storeAs($dir, $filename);

        $book->file_path = $path;
        $book->save();

        return response()->json([
            'message' => 'Ebook uploaded.',
            'file_path' => $book->file_path,
        ]);
    }
}
