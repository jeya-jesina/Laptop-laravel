<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Upload any provided files to Cloudinary and return the resolved media values.
     * Precedence: explicit URL inputs win; otherwise uploaded files are used.
     */
    protected function resolveMedia(Request $request, array $existing = []): array
    {
        $cloudinary = app(CloudinaryService::class);

        $image = trim($request->input('image', ''));
        $videoUrl = trim($request->input('video_url', ''));
        $imageGallery = $request->input('image_gallery_json', $request->input('image_gallery', ''));

        // Primary image from file
        if ($image === '' && $request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $res = $cloudinary->upload($file->getRealPath(), 'image', 'products');
            if ($res['success']) {
                $image = $res['url'];
            }
        }

        // Video from file
        if ($videoUrl === '' && $request->hasFile('video_file')) {
            $file = $request->file('video_file');
            $res = $cloudinary->upload($file->getRealPath(), 'video', 'product-videos');
            if ($res['success']) {
                $videoUrl = $res['url'];
            }
        }

        // Gallery: explicit JSON/array, otherwise uploaded multiple files
        $gallery = [];
        if (is_array($imageGallery)) {
            $gallery = array_values(array_filter($imageGallery, fn($v) => trim((string) $v) !== ''));
        } elseif (is_string($imageGallery) && $imageGallery !== '') {
            $decoded = json_decode($imageGallery, true);
            $gallery = is_array($decoded) ? array_values(array_filter($decoded, fn($v) => trim((string) $v) !== '')) : [];
        }

        if ($request->hasFile('image_files')) {
            foreach ($request->file('image_files') as $file) {
                $res = $cloudinary->upload($file->getRealPath(), 'image', 'products');
                if ($res['success']) {
                    $gallery[] = $res['url'];
                }
            }
        }

        // Fall back to existing values when editing
        $image = $image !== '' ? $image : ($existing['image'] ?? '');
        $videoUrl = $videoUrl !== '' ? $videoUrl : ($existing['video_url'] ?? '');
        if (empty($gallery) && !empty($existing['image_gallery_json'])) {
            $decoded = json_decode($existing['image_gallery_json'], true);
            if (is_array($decoded)) {
                $gallery = $decoded;
            }
        }

        return [
            'image' => $image ?: null,
            'video_url' => $videoUrl ?: null,
            'image_gallery_json' => !empty($gallery) ? json_encode(array_values($gallery)) : null,
        ];
    }

    public function add(Request $request)
    {
        $product_name      = trim($request->input('product_name', ''));
        $product_code      = trim($request->input('product_code', ''));
        $category_id       = intval($request->input('category_id', 0));
        $subcategory_id    = intval($request->input('subcategory_id', 0));
        $brand_id          = intval($request->input('brand_id', 0));
        $profession_id     = intval($request->input('profession_id', 0));
        $price             = floatval($request->input('price', 0));
        $stock             = intval($request->input('stock', 0));
        $barcode           = trim($request->input('barcode', ''));
        $unit              = trim($request->input('unit', ''));
        $gst_percentage    = floatval($request->input('gst_percentage', 0));
        $company_id        = intval($request->input('company_id', 0));
        $supplier_id       = intval($request->input('supplier_id', 0));
        $model             = trim($request->input('model', ''));
        $processor         = trim($request->input('processor', ''));
        $ram               = trim($request->input('ram', ''));
        $storage           = trim($request->input('storage', ''));
        $storage_type      = trim($request->input('storage_type', ''));
        $graphics          = trim($request->input('graphics', ''));
        $display_size      = trim($request->input('display_size', ''));
        $operating_system  = trim($request->input('operating_system', ''));
        $condition_grade   = trim($request->input('condition_grade', ''));
        $battery_health    = trim($request->input('battery_health', ''));
        $warranty          = trim($request->input('warranty', ''));
        $charger_available = intval($request->input('charger_available', 0)) ? 1 : 0;
        $description       = trim($request->input('description', ''));
        $short_description = trim($request->input('short_description', ''));
        $full_description  = trim($request->input('full_description', ''));
        $offer_price       = floatval($request->input('offer_price', 0));
        $original_price    = floatval($request->input('original_price', 0));
        $status            = trim($request->input('status', 'active'));
        $is_offer          = intval($request->input('is_offer', 0)) ? 1 : 0;

        if (!$product_name || !$company_id) {
            return response()->json([
                "status" => false,
                "message" => "Product Name and Company ID required"
            ]);
        }

        if (!in_array($status, ['active', 'inactive'])) {
            $status = 'active';
        }

        $media = $this->resolveMedia($request);

        Product::create([
            'product_name' => $product_name,
            'product_code' => $product_code ?: null,
            'category_id' => $category_id ?: null,
            'subcategory_id' => $subcategory_id ?: null,
            'brand_id' => $brand_id ?: null,
            'profession_id' => $profession_id ?: null,
            'model' => $model ?: null,
            'processor' => $processor ?: null,
            'ram' => $ram ?: null,
            'storage' => $storage ?: null,
            'storage_type' => $storage_type ?: null,
            'graphics' => $graphics ?: null,
            'display_size' => $display_size ?: null,
            'operating_system' => $operating_system ?: null,
            'condition_grade' => $condition_grade ?: null,
            'battery_health' => $battery_health ?: null,
            'warranty' => $warranty ?: null,
            'charger_available' => $charger_available,
            'description' => $description ?: null,
            'image' => $media['image'],
            'video_url' => $media['video_url'],
            'image_gallery_json' => $media['image_gallery_json'],
            'short_description' => $short_description ?: null,
            'full_description' => $full_description ?: null,
            'price' => $price,
            'offer_price' => $offer_price > 0 ? $offer_price : null,
            'original_price' => $original_price > 0 ? $original_price : null,
            'is_offer' => $is_offer,
            'stock' => $stock,
            'barcode' => $barcode ?: null,
            'unit' => $unit ?: null,
            'gst_percentage' => $gst_percentage,
            'company_id' => $company_id,
            'supplier_id' => $supplier_id ?: null,
            'status' => $status,
            'is_deleted' => 0
        ]);

        return response()->json([
            "status" => true,
            "message" => "Product created successfully"
        ]);
    }

    public function delete(Request $request)
    {
        $id = intval($request->input('id', 0));
        if (!$id) {
            return response()->json([
                "status" => false,
                "message" => "ID required"
            ]);
        }

        Product::where('id', $id)->update(['is_deleted' => 1]);

        return response()->json([
            "status" => true,
            "message" => "Product deleted successfully"
        ]);
    }

    public function get(Request $request)
    {
        $company_id = intval($request->input('company_id') ?: $request->query('company_id', 0));
        $brand_id = intval($request->input('brand_id') ?: $request->query('brand_id', 0));

        if (!$company_id) {
            return response()->json([
                "status" => true,
                "data" => []
            ]);
        }

        $query = DB::table('products as p')
            ->leftJoin('categories as c', 'p.category_id', '=', 'c.id')
            ->leftJoin('subcategories as sc', 'p.subcategory_id', '=', 'sc.id')
            ->leftJoin('brands as b', 'p.brand_id', '=', 'b.id')
            ->leftJoin('companies as comp', 'p.company_id', '=', 'comp.id')
            ->leftJoin('suppliers as sup', 'p.supplier_id', '=', 'sup.id')
            ->select(
                'p.*',
                'c.name as category_name',
                'sc.name as subcategory_name',
                'b.name as brand_name',
                'comp.company_name',
                'comp.gstin as company_gstin',
                'comp.gst_type',
                'sup.supplier_name'
            )
            ->where('p.company_id', $company_id)
            ->where('p.is_deleted', 0);

        if ($brand_id > 0) {
            $query->where('p.brand_id', $brand_id);
        }

        $products = $query->orderBy('p.id', 'desc')->get();

        return response()->json([
            "status" => true,
            "data" => $products
        ]);
    }

    public function getById(Request $request)
    {
        $id = intval($request->input('id') ?: $request->query('id', 0));
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                "status" => false,
                "message" => "Product not found"
            ]);
        }

        return response()->json([
            "status" => true,
            "data" => $product
        ]);
    }

    public function getBySupplier(Request $request)
    {
        $supplier_id = intval($request->input('supplier_id') ?: $request->query('supplier_id', 0));

        if (!$supplier_id) {
            return response()->json(["status" => false, "message" => "supplier_id required"]);
        }

        $products = DB::table('products as p')
            ->leftJoin('companies as c', 'p.company_id', '=', 'c.id')
            ->leftJoin('categories as cat', 'p.category_id', '=', 'cat.id')
            ->select('p.*', 'c.company_name', 'cat.name as category_name')
            ->where('p.supplier_id', $supplier_id)
            ->where('p.is_deleted', 0)
            ->orderBy('p.id', 'desc')
            ->get();

        return response()->json(["status" => true, "data" => $products]);
    }

    public function toggleStatusProduct(Request $request)
    {
        $id = intval($request->input('id', 0));
        $status = $request->input('status', '');

        if (!$id || !$status) {
            return response()->json(["status" => false, "message" => "Invalid data"]);
        }

        Product::where('id', $id)->update(['status' => $status]);

        return response()->json(["status" => true, "message" => "Status updated successfully"]);
    }

    public function getByCode(Request $request)
    {
        $company_id   = intval($request->query('company_id', 0));
        $product_code = trim($request->query('product_code', ''));

        if (!$company_id || !$product_code) {
            return response()->json(["status" => false, "message" => "company_id and product_code required"]);
        }

        $product = DB::table('products as p')
            ->leftJoin('categories as c', 'p.category_id', '=', 'c.id')
            ->leftJoin('subcategories as sc', 'p.subcategory_id', '=', 'sc.id')
            ->leftJoin('brands as b', 'p.brand_id', '=', 'b.id')
            ->select(
                'p.*',
                'c.name as category_name',
                'sc.name as subcategory_name',
                'b.name as brand_name'
            )
            ->where('p.company_id', $company_id)
            ->where('p.product_code', $product_code)
            ->where('p.is_deleted', 0)
            ->first();

        if (!$product) {
            return response()->json(["status" => false, "message" => "Product not found"]);
        }

        return response()->json(["status" => true, "data" => $product]);
    }

    public function update(Request $request)
    {
        $id               = intval($request->input('id', 0));
        $product_name     = trim($request->input('product_name', ''));
        $product_code     = trim($request->input('product_code', ''));
        $category_id      = intval($request->input('category_id', 0));
        $subcategory_id   = intval($request->input('subcategory_id', 0));
        $brand_id         = intval($request->input('brand_id', 0));
        $profession_id    = intval($request->input('profession_id', 0));
        $price            = floatval($request->input('price', 0));
        $stock            = intval($request->input('stock', 0));
        $barcode          = trim($request->input('barcode', ''));
        $unit             = trim($request->input('unit', ''));
        $gst_percentage   = floatval($request->input('gst_percentage', 0));
        $supplier_id      = intval($request->input('supplier_id', 0));
        $model            = trim($request->input('model', ''));
        $processor        = trim($request->input('processor', ''));
        $ram              = trim($request->input('ram', ''));
        $storage          = trim($request->input('storage', ''));
        $storage_type     = trim($request->input('storage_type', ''));
        $graphics         = trim($request->input('graphics', ''));
        $display_size     = trim($request->input('display_size', ''));
        $operating_system = trim($request->input('operating_system', ''));
        $condition_grade  = trim($request->input('condition_grade', ''));
        $battery_health   = trim($request->input('battery_health', ''));
        $warranty         = trim($request->input('warranty', ''));
        $charger_available = intval($request->input('charger_available', 0)) ? 1 : 0;
        $description      = trim($request->input('description', ''));
        $short_description = trim($request->input('short_description', ''));
        $full_description = trim($request->input('full_description', ''));
        $offer_price      = floatval($request->input('offer_price', 0));
        $original_price   = floatval($request->input('original_price', 0));
        $status           = trim($request->input('status', 'active'));
        $is_offer         = intval($request->input('is_offer', 0)) ? 1 : 0;

        if (!$id || !$product_name) {
            return response()->json(["status" => false, "message" => "ID and Product Name required"]);
        }

        if (!in_array($status, ['active', 'inactive'])) {
            $status = 'active';
        }

        $existing = Product::where('id', $id)->first();
        if (!$existing) {
            return response()->json(["status" => false, "message" => "Product not found"]);
        }

        $media = $this->resolveMedia($request, [
            'image' => $existing->image,
            'video_url' => $existing->video_url,
            'image_gallery_json' => $existing->image_gallery_json,
        ]);

        Product::where('id', $id)->update([
            'product_name' => $product_name,
            'product_code' => $product_code ?: null,
            'category_id' => $category_id ?: null,
            'subcategory_id' => $subcategory_id ?: null,
            'brand_id' => $brand_id ?: null,
            'profession_id' => $profession_id ?: null,
            'model' => $model ?: null,
            'processor' => $processor ?: null,
            'ram' => $ram ?: null,
            'storage' => $storage ?: null,
            'storage_type' => $storage_type ?: null,
            'graphics' => $graphics ?: null,
            'display_size' => $display_size ?: null,
            'operating_system' => $operating_system ?: null,
            'condition_grade' => $condition_grade ?: null,
            'battery_health' => $battery_health ?: null,
            'warranty' => $warranty ?: null,
            'charger_available' => $charger_available,
            'description' => $description ?: null,
            'image' => $media['image'],
            'video_url' => $media['video_url'],
            'image_gallery_json' => $media['image_gallery_json'],
            'short_description' => $short_description ?: null,
            'full_description' => $full_description ?: null,
            'price' => $price,
            'offer_price' => $offer_price > 0 ? $offer_price : null,
            'original_price' => $original_price > 0 ? $original_price : null,
            'is_offer' => $is_offer,
            'stock' => $stock,
            'barcode' => $barcode ?: null,
            'unit' => $unit ?: null,
            'gst_percentage' => $gst_percentage,
            'supplier_id' => $supplier_id ?: null,
            'status' => $status
        ]);

        return response()->json(["status" => true, "message" => "Product updated successfully"]);
    }
}
