<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Mock checkout: immediately marks the order as paid.
     * provider: 'mock' (default)
     */
    public function checkout(Request $request)
    {
        $data = $request->validate([
            'order_id' => ['required','integer','exists:orders,id'],
            'provider' => ['nullable','string','max:50'],
        ]);

        $provider = $data['provider'] ?? 'mock';

        $order = Order::query()
            ->where('id', $data['order_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Order is not pending.'], 400);
        }

        $payment = DB::transaction(function () use ($order, $provider) {
            $payment = Payment::create([
                'order_id' => $order->id,
                'provider' => $provider,
                'provider_ref' => 'MOCK-' . strtoupper(bin2hex(random_bytes(6))),
                'amount' => $order->total_amount,
                'currency' => 'USD',
                'status' => 'paid',
                'paid_at' => now(),
                'payload' => ['mode' => 'mock'],
            ]);

            $order->status = 'paid';
            $order->save();

            return $payment;
        });

        return response()->json([
            'message' => 'Payment successful (mock).',
            'order' => $order->fresh()->load('items.book'),
            'payment' => $payment,
        ]);
    }
}
