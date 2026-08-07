<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profession;

class ProfessionController extends Controller
{
    public function create(Request $request)
    {
        $name = trim($request->input('name', ''));
        $company_id = intval($request->input('company_id', 0));

        if (!$name || !$company_id) {
            return response()->json([
                "status" => false,
                "message" => "Profession Name and Company are required"
            ]);
        }

        Profession::create([
            'name' => $name,
            'company_id' => $company_id,
            'status' => 'active',
            'is_deleted' => 0
        ]);

        return response()->json([
            "status" => true,
            "message" => "Profession created successfully"
        ]);
    }

    public function getActive(Request $request)
    {
        $company_id = intval($request->input('company_id') ?: $request->query('company_id'));

        $professions = Profession::where('company_id', $company_id)
            ->where('status', 'active')
            ->where('is_deleted', 0)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            "status" => true,
            "data" => $professions
        ]);
    }

    public function getAll(Request $request)
    {
        $company_id = intval($request->input('company_id') ?: $request->query('company_id'));

        $professions = Profession::where('company_id', $company_id)
            ->where('is_deleted', 0)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            "status" => true,
            "data" => $professions
        ]);
    }

    public function getById(Request $request)
    {
        $id = intval($request->input('id') ?: $request->query('id'));
        $profession = Profession::where('id', $id)->where('is_deleted', 0)->first();

        if (!$profession) {
            return response()->json([
                "status" => false,
                "message" => "Profession not found"
            ]);
        }

        return response()->json([
            "status" => true,
            "data" => $profession
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

        Profession::where('id', $id)->update(['status' => $status]);

        return response()->json([
            "status" => true,
            "message" => "Status updated successfully"
        ]);
    }

    public function update(Request $request)
    {
        $id = intval($request->input('id'));
        $name = trim($request->input('name', ''));

        if (!$id || !$name) {
            return response()->json([
                "status" => false,
                "message" => "Profession Name is required"
            ]);
        }

        Profession::where('id', $id)->update([
            'name' => $name
        ]);

        return response()->json([
            "status" => true,
            "message" => "Profession updated successfully"
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

        Profession::where('id', $id)->update(['is_deleted' => 1]);

        return response()->json([
            "status" => true,
            "message" => "Profession deleted successfully"
        ]);
    }
}
