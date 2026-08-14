<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;

class BannerController extends Controller
{
    public function create(Request $request)
    {
        $title = trim($request->input('title', ''));
        $description = trim($request->input('description', ''));
        $image_url = trim($request->input('image_url', ''));
        $link_url = trim($request->input('link_url', ''));
        $banner_group = trim($request->input('banner_group', 'home_top')) ?: 'home_top';
        $company_id = intval($request->input('company_id', 0));
        $sort_order = intval($request->input('sort_order', 0));
        $subtitle = trim($request->input('subtitle', ''));
        $badge = trim($request->input('badge', ''));
        $price = $request->input('price');
        $mrp = $request->input('mrp');
        $bg_color = trim($request->input('bg_color', ''));
        $rating = $request->input('rating');
        $timer_end_at = $request->input('timer_end_at');
        $product_id = intval($request->input('product_id', 0));

        $textOnlyGroups = ['corporate_offer', 'testimonial'];

        if (!$company_id) {
            return response()->json([
                "status" => false,
                "message" => "Company is required"
            ]);
        }

        if (!$image_url && !in_array($banner_group, $textOnlyGroups)) {
            return response()->json([
                "status" => false,
                "message" => "Banner Image is required"
            ]);
        }

        Banner::create([
            'title' => $title ?: null,
            'description' => $description ?: null,
            'image_url' => $image_url ?: null,
            'link_url' => $link_url ?: null,
            'banner_group' => $banner_group,
            'sort_order' => $sort_order,
            'company_id' => $company_id,
            'product_id' => $product_id > 0 ? $product_id : null,
            'status' => 'active',
            'is_deleted' => 0,
            'subtitle' => $subtitle !== '' ? $subtitle : null,
            'badge' => $badge !== '' ? $badge : null,
            'price' => ($price !== null && $price !== '') ? floatval($price) : null,
            'mrp' => ($mrp !== null && $mrp !== '') ? floatval($mrp) : null,
            'bg_color' => $bg_color !== '' ? $bg_color : null,
            'rating' => ($rating !== null && $rating !== '') ? floatval($rating) : null,
            'timer_end_at' => $timer_end_at ?: null
        ]);

        return response()->json([
            "status" => true,
            "message" => "Banner created successfully"
        ]);
    }

    public function getActive(Request $request)
    {
        $company_id = intval($request->input('company_id') ?: $request->query('company_id'));
        $group = trim($request->input('banner_group') ?: $request->query('banner_group', ''));

        $query = Banner::where('status', 'active')
            ->where('is_deleted', 0);

        if ($company_id > 0) {
            $query->where('company_id', $company_id);
        }

        if ($group !== '') {
            $query->where('banner_group', $group);
        }

        $banners = $query->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->get();

        // Fallback: if the requested company has no banners, return any active
        // banner for the group so the storefront never shows empty content.
        if ($banners->isEmpty() && $company_id > 0) {
            $fallback = Banner::where('status', 'active')
                ->where('is_deleted', 0);

            if ($group !== '') {
                $fallback->where('banner_group', $group);
            }

            $banners = $fallback->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->get();
        }

        return response()->json([
            "status" => true,
            "data" => $banners
        ]);
    }

    public function getAll(Request $request)
    {
        $company_id = intval($request->input('company_id') ?: $request->query('company_id'));

        $banners = Banner::where('company_id', $company_id)
            ->where('is_deleted', 0)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            "status" => true,
            "data" => $banners
        ]);
    }

    public function getById(Request $request)
    {
        $id = intval($request->input('id') ?: $request->query('id'));
        $banner = Banner::where('id', $id)->where('is_deleted', 0)->first();

        if (!$banner) {
            return response()->json([
                "status" => false,
                "message" => "Banner not found"
            ]);
        }

        return response()->json([
            "status" => true,
            "data" => $banner
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

        Banner::where('id', $id)->update(['status' => $status]);

        return response()->json([
            "status" => true,
            "message" => "Status updated successfully"
        ]);
    }

    public function update(Request $request)
    {
        $id = intval($request->input('id'));
        $title = trim($request->input('title', ''));
        $description = trim($request->input('description', ''));
        $image_url = trim($request->input('image_url', ''));
        $link_url = trim($request->input('link_url', ''));
        $banner_group = trim($request->input('banner_group', 'home_top')) ?: 'home_top';
        $sort_order = intval($request->input('sort_order', 0));
        $subtitle = trim($request->input('subtitle', ''));
        $badge = trim($request->input('badge', ''));
        $price = $request->input('price');
        $mrp = $request->input('mrp');
        $bg_color = trim($request->input('bg_color', ''));
        $rating = $request->input('rating');
        $timer_end_at = $request->input('timer_end_at');
        $product_id = intval($request->input('product_id', 0));

        $textOnlyGroups = ['corporate_offer', 'testimonial'];

        if (!$id) {
            return response()->json([
                "status" => false,
                "message" => "Invalid data"
            ]);
        }

        if (!$image_url && !in_array($banner_group, $textOnlyGroups)) {
            return response()->json([
                "status" => false,
                "message" => "Banner Image is required"
            ]);
        }

        Banner::where('id', $id)->update([
            'title' => $title ?: null,
            'description' => $description ?: null,
            'image_url' => $image_url ?: null,
            'link_url' => $link_url ?: null,
            'banner_group' => $banner_group,
            'sort_order' => $sort_order,
            'product_id' => $product_id > 0 ? $product_id : null,
            'subtitle' => $subtitle !== '' ? $subtitle : null,
            'badge' => $badge !== '' ? $badge : null,
            'price' => ($price !== null && $price !== '') ? floatval($price) : null,
            'mrp' => ($mrp !== null && $mrp !== '') ? floatval($mrp) : null,
            'bg_color' => $bg_color !== '' ? $bg_color : null,
            'rating' => ($rating !== null && $rating !== '') ? floatval($rating) : null,
            'timer_end_at' => $timer_end_at ?: null
        ]);

        return response()->json([
            "status" => true,
            "message" => "Banner updated successfully"
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

        Banner::where('id', $id)->update(['is_deleted' => 1]);

        return response()->json([
            "status" => true,
            "message" => "Banner deleted successfully"
        ]);
    }
}
