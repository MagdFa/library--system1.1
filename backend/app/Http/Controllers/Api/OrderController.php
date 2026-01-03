<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function myOrders(Request $request)
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items.book')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required','array','min:1'],
            'items.*.book_id' => ['required','integer','exists:books,id'],
        ]);

        $userId = $request->user()->id;
        $bookIds = collect($data['items'])->pluck('book_id')->unique()->values();

        $books = Book::query()->whereIn('id', $bookIds)->get();

        // Allow purchase for digital books only (can be adjusted)
        foreach ($books as $b) {
            if (!$b->is_digital) {
                return response()->json(['message' => "Book '{$b->title}' is not purchasable (not digital)."], 400);
            }
        }

        $total = $books->sum(fn($b) => (float)$b->price);

        $order = DB::transaction(function () use ($userId, $books, $total) {
            $order = Order::create([
                'user_id' => $userId,
                'status' => 'pending',
                'total_amount' => $total,
            ]);

            foreach ($books as $b) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'book_id' => $b->id,
                    'unit_price' => $b->price,
                ]);
            }

            return $order;
        });

        return response()->json($order->load('items.book'), 201);
    }
}
