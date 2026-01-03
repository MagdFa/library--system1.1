<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function myLoans(Request $request)
    {
        $loans = Loan::query()
            ->where('user_id', $request->user()->id)
            ->with('book.categories')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($loans);
    }
}
