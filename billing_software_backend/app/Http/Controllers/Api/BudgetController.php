<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Budget;

class BudgetController extends Controller
{
    public function create(Request $request)
    {
        $name = trim($request->input('name', ''));
        $min_price = trim($request->input('min_price', ''));
        $max_price = trim($request->input('max_price', ''));
        $company_id = intval($request->input('company_id', 0));

        if (!$name || !$company_id) {
            return response()->json([
                "status" => false,
                "message" => "Budget Name and Company are required"
            ]);
        }

        Budget::create([
            'name' => $name,
            'min_price' => $min_price !== '' ? floatval($min_price) : null,
            'max_price' => $max_price !== '' ? floatval($max_price) : null,
            'company_id' => $company_id,
            'status' => 'active',
            'is_deleted' => 0
        ]);

        return response()->json([
            "status" => true,
            "message" => "Budget created successfully"
        ]);
    }

    public function getActive(Request $request)
    {
        $company_id = intval($request->input('company_id') ?: $request->query('company_id'));

        $budgets = Budget::where('company_id', $company_id)
            ->where('status', 'active')
            ->where('is_deleted', 0)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            "status" => true,
            "data" => $budgets
        ]);
    }

    public function getAll(Request $request)
    {
        $company_id = intval($request->input('company_id') ?: $request->query('company_id'));

        $budgets = Budget::where('company_id', $company_id)
            ->where('is_deleted', 0)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            "status" => true,
            "data" => $budgets
        ]);
    }

    public function getById(Request $request)
    {
        $id = intval($request->input('id') ?: $request->query('id'));
        $budget = Budget::where('id', $id)->where('is_deleted', 0)->first();

        if (!$budget) {
            return response()->json([
                "status" => false,
                "message" => "Budget not found"
            ]);
        }

        return response()->json([
            "status" => true,
            "data" => $budget
        ]);
    }

    public function statusToggle(Request $request)
    {
        $id = intval($request->input('id'));
        $status = $request->input('status');

        if (!$id || !$status) {
            return response()->json([
                "status" => false,
                "message" => "Invalid data"
            ]);
        }

        Budget::where('id', $id)->update(['status' => $status]);

        return response()->json([
            "status" => true,
            "message" => "Status updated successfully"
        ]);
    }

    public function update(Request $request)
    {
        $id = intval($request->input('id'));
        $name = trim($request->input('name', ''));
        $min_price = trim($request->input('min_price', ''));
        $max_price = trim($request->input('max_price', ''));

        if (!$id || !$name) {
            return response()->json([
                "status" => false,
                "message" => "Budget Name is required"
            ]);
        }

        Budget::where('id', $id)->update([
            'name' => $name,
            'min_price' => $min_price !== '' ? floatval($min_price) : null,
            'max_price' => $max_price !== '' ? floatval($max_price) : null
        ]);

        return response()->json([
            "status" => true,
            "message" => "Budget updated successfully"
        ]);
    }

    public function delete(Request $request)
    {
        $id = intval($request->input('id'));

        if (!$id) {
            return response()->json([
                "status" => false,
                "message" => "Invalid data"
            ]);
        }

        Budget::where('id', $id)->update(['is_deleted' => 1]);

        return response()->json([
            "status" => true,
            "message" => "Budget deleted successfully"
        ]);
    }
}
