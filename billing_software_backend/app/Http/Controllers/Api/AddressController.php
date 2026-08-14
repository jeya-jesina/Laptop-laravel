<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\UserAddress;

class AddressController extends Controller
{
    /**
     * GET /address?user_id=
     */
    public function index(Request $request)
    {
        $user_id = intval($request->query('user_id', 0));

        if (!$user_id) {
            return response()->json(["success" => true, "data" => []]);
        }

        $addresses = UserAddress::where('user_id', $user_id)
            ->orderByDesc('is_default')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            "success" => true,
            "data" => $addresses,
        ]);
    }

    /**
     * POST /address
     */
    public function store(Request $request)
    {
        $user_id = intval($request->input('user_id', 0));
        if (!$user_id) {
            return response()->json(["success" => false, "message" => "User required"]);
        }

        $address = trim($request->input('address', ''));
        if (!$address) {
            return response()->json(["success" => false, "message" => "Address required"]);
        }

        $isFirst = UserAddress::where('user_id', $user_id)->count() === 0;
        $isDefault = $request->input('is_default', $isFirst ? 1 : 0) == 1 || $isFirst;

        if ($isDefault) {
            UserAddress::where('user_id', $user_id)->update(['is_default' => 0]);
        }

        $model = UserAddress::create([
            'user_id' => $user_id,
            'label' => trim($request->input('label', '')) ?: 'Home',
            'name' => trim($request->input('name', '')),
            'phone' => trim($request->input('phone', '')),
            'email' => trim($request->input('email', '')),
            'address' => $address,
            'city' => trim($request->input('city', '')),
            'state' => trim($request->input('state', '')),
            'pincode' => trim($request->input('pincode', '')),
            'country' => trim($request->input('country', 'India')),
            'is_default' => $isDefault ? 1 : 0,
        ]);

        return response()->json([
            "success" => true,
            "message" => "Address added successfully",
            "data" => $model,
        ]);
    }

    /**
     * POST /address/{id}
     */
    public function update(Request $request, $id)
    {
        $user_id = intval($request->input('user_id', 0));
        $address = UserAddress::where('id', intval($id))->where('user_id', $user_id)->first();

        if (!$address) {
            return response()->json(["success" => false, "message" => "Address not found"]);
        }

        $updates = [];
        foreach (['label', 'name', 'phone', 'email', 'address', 'city', 'state', 'pincode', 'country'] as $field) {
            if ($request->has($field)) {
                $updates[$field] = trim($request->input($field, ''));
            }
        }

        if ($request->input('is_default', 0) == 1) {
            UserAddress::where('user_id', $user_id)->update(['is_default' => 0]);
            $updates['is_default'] = 1;
        }

        $address->update($updates);

        return response()->json([
            "success" => true,
            "message" => "Address updated successfully",
            "data" => $address,
        ]);
    }

    /**
     * POST /address/{id}/default
     */
    public function setDefault(Request $request, $id)
    {
        $user_id = intval($request->input('user_id', 0));
        $address = UserAddress::where('id', intval($id))->where('user_id', $user_id)->first();

        if (!$address) {
            return response()->json(["success" => false, "message" => "Address not found"]);
        }

        UserAddress::where('user_id', $user_id)->update(['is_default' => 0]);
        $address->update(['is_default' => 1]);

        return response()->json([
            "success" => true,
            "message" => "Default address updated",
        ]);
    }

    /**
     * DELETE /address/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user_id = intval($request->query('user_id', $request->input('user_id', 0)));
        $address = UserAddress::where('id', intval($id))->where('user_id', $user_id)->first();

        if (!$address) {
            return response()->json(["success" => false, "message" => "Address not found"]);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $next = UserAddress::where('user_id', $user_id)->orderByDesc('id')->first();
            if ($next) {
                $next->update(['is_default' => 1]);
            }
        }

        return response()->json([
            "success" => true,
            "message" => "Address deleted successfully",
        ]);
    }
}
