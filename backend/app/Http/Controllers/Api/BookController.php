/**
 * تعديل بواسطة الطالب
 * جزء إدارة الكتب - Backend Laravel
 */
هذه الدالة مسؤولة عن جلب قائمة الكتب

<?php 

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');
        $categoryId = $request->query('category_id');
        $author = $request->query('author');
        $availableOnly = filter_var($request->query('available_only', false), FILTER_VALIDATE_BOOLEAN);
        $digitalOnly = filter_var($request->query('digital_only', false), FILTER_VALIDATE_BOOLEAN);

        $query = Book::query()->with('categories');

        if ($q) {
            $query->where(function($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('author', 'like', "%{$q}%")
                    ->orWhere('isbn', 'like', "%{$q}%");
            });
        }
        if ($categoryId) {
            $query->whereHas('categories', fn($c) => $c->where('categories.id', $categoryId));
        }
        if ($author) {
            $query->where('author', 'like', "%{$author}%");
        }
        if ($availableOnly) {
            $query->where('available_copies', '>', 0);
        }
        if ($digitalOnly) {
            $query->where('is_digital', true);
        }

        $books = $query->orderBy('title')->paginate(12);

        return response()->json($books);
    }

    public function show(Book $book)
    {
        $book->load('categories');
        return response()->json($book);
    }

    /**
     * Open a reading session. Returns a stream URL (inline) if allowed.
     */
    public function openReadingSession(Request $request, Book $book)
    {
        if (!$book->is_digital) {
            return response()->json(['message' => 'This is not a digital book.'], 400);
        }

        $user = $request->user();
        $purchased = $this->userHasPurchasedBook($user->id, $book->id);

        // Policy: allow reading if purchased OR price==0
        $allowed = $purchased || ((float)$book->price === 0.0);

        if (!$allowed) {
            return response()->json(['message' => 'Purchase required to read this book.'], 403);
        }

        return response()->json([
            'stream_url' => url("/api/books/{$book->id}/download?stream=1"),
            'download_allowed' => $purchased, // allow download only if purchased
        ]);
    }

    /**
     * Download or stream the ebook file (if authorized).
     * Query: ?stream=1 => inline
     */
    public function download(Request $request, Book $book)
    {
        if (!$book->is_digital || !$book->file_path) {
            return response()->json(['message' => 'No ebook file available.'], 404);
        }

        $user = $request->user();
        $purchased = $this->userHasPurchasedBook($user->id, $book->id);

        $stream = filter_var($request->query('stream', false), FILTER_VALIDATE_BOOLEAN);

        // For streaming: allow if purchased OR free
        if ($stream) {
            $allowed = $purchased || ((float)$book->price === 0.0);
            if (!$allowed) {
                return response()->json(['message' => 'Purchase required.'], 403);
            }
        } else {
            // For download: require purchase
            if (!$purchased) {
                return response()->json(['message' => 'Purchase required to download.'], 403);
            }
        }

        $absPath = storage_path('app/' . ltrim($book->file_path, '/'));
        if (!file_exists($absPath)) {
            return response()->json(['message' => 'File missing on server.'], 404);
        }

        $filename = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $book->title) . '.pdf';

        if ($stream) {
            return response()->file($absPath, [
                'Content-Disposition' => 'inline; filename="'.$filename.'"',
            ]);
        }

        return response()->download($absPath, $filename);
    }

    private function userHasPurchasedBook(int $userId, int $bookId): bool
    {
        return OrderItem::query()
            ->where('book_id', $bookId)
            ->whereHas('order', function ($q) use ($userId) {
                $q->where('user_id', $userId)->where('status', 'paid');
            })
            ->exists();
    }
}
