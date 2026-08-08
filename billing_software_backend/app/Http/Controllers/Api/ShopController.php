<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ShopCart;
use App\Models\ShopWishlist;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Company;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class ShopController extends Controller
{
    /**
     * GET /shop/products
     * Public product listing with filtering, sorting and pagination.
     */
    public function index(Request $request)
    {
        $company_id   = intval($request->query('company_id', 1));
        $category_id  = intval($request->query('category_id', 0));
        $subcategory_id = intval($request->query('subcategory_id', 0));
        $brand_id     = intval($request->query('brand_id', 0));
        $budget_id    = intval($request->query('budget_id', 0));
        $profession_id = intval($request->query('profession_id', 0));
        $search       = trim($request->query('search', ''));
        $sort         = trim($request->query('sort', 'newest'));
        $per_page     = intval($request->query('per_page', 20));
        $price_min    = floatval($request->query('price_min', 0));
        $price_max    = floatval($request->query('price_max', 0));
        $availability = trim($request->query('availability', ''));
        $rating       = intval($request->query('rating', 0));
        $offer        = intval($request->query('offer', 0));
        $home_budget  = intval($request->query('home_budget', 0));

        $csv = function ($key) use ($request) {
            $raw = $request->query($key, '');
            if (is_array($raw)) {
                return array_values(array_filter(array_map('trim', $raw), fn($v) => $v !== ''));
            }
            return array_values(array_filter(array_map('trim', explode(',', $raw)), fn($v) => $v !== ''));
        };

        $brandIds      = array_values(array_filter(array_map('intval', $csv('brand_id')), fn($v) => $v > 0));
        if ($brand_id > 0) {
            $brandIds[] = $brand_id;
            $brandIds = array_values(array_unique($brandIds));
        }
        $processors    = $csv('processor');
        $rams          = $csv('ram');
        $storages      = $csv('storage');
        $storageTypes  = $csv('storage_type');
        $conditions    = $csv('condition_grade');
        $operatingSystems = $csv('operating_system');

        if ($per_page < 1) {
            $per_page = 20;
        }

        $query = Product::query()
            ->leftJoin('categories as c', 'products.category_id', '=', 'c.id')
            ->leftJoin('brands as b', 'products.brand_id', '=', 'b.id')
            ->select('products.*', 'c.name as category_name', 'b.name as brand_name')
            ->where('products.company_id', $company_id)
            ->where('products.is_deleted', 0)
            ->where('products.status', 'active');

        if ($category_id > 0) {
            $query->where('products.category_id', $category_id);
        }

        if ($subcategory_id > 0) {
            $query->where('products.subcategory_id', $subcategory_id);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('products.product_name', 'like', "%{$search}%")
                    ->orWhere('products.model', 'like', "%{$search}%")
                    ->orWhere('products.product_code', 'like', "%{$search}%")
                    ->orWhere('products.processor', 'like', "%{$search}%");
            });
        }

        if ($price_min > 0 || $price_max > 0) {
            $query->where(function ($q) use ($price_min, $price_max) {
                if ($price_min > 0) {
                    $q->where('products.price', '>=', $price_min);
                }
                if ($price_max > 0) {
                    $q->where('products.price', '<=', $price_max);
                }
            });
        }

        if (!empty($brandIds)) {
            $query->whereIn('products.brand_id', $brandIds);
        }

        if ($budget_id > 0) {
            $budget = DB::table('budgets')
                ->where('id', $budget_id)
                ->where('company_id', $company_id)
                ->where('is_deleted', 0)
                ->first();
            if ($budget) {
                if ($budget->min_price !== null && floatval($budget->min_price) > 0) {
                    $query->where('products.price', '>=', floatval($budget->min_price));
                }
                if ($budget->max_price !== null && floatval($budget->max_price) > 0) {
                    $query->where('products.price', '<=', floatval($budget->max_price));
                }
            }
        }

        if ($profession_id > 0) {
            $query->where('products.profession_id', $profession_id);
        }
        if (!empty($processors)) {
            $query->where(function ($q) use ($processors) {
                foreach ($processors as $p) {
                    $q->orWhere('products.processor', 'like', "%{$p}%");
                }
            });
        }
        if (!empty($rams)) {
            $query->where(function ($q) use ($rams) {
                foreach ($rams as $r) {
                    $q->orWhere('products.ram', 'like', "%{$r}%");
                }
            });
        }
        if (!empty($storages)) {
            $query->where(function ($q) use ($storages) {
                foreach ($storages as $s) {
                    $q->orWhere('products.storage', 'like', "%{$s}%");
                }
            });
        }
        if (!empty($storageTypes)) {
            $query->where(function ($q) use ($storageTypes) {
                foreach ($storageTypes as $st) {
                    $q->orWhere('products.storage_type', 'like', "%{$st}%");
                }
            });
        }
        if (!empty($conditions)) {
            $query->whereIn('products.condition_grade', $conditions);
        }
        if (!empty($operatingSystems)) {
            $query->where(function ($q) use ($operatingSystems) {
                foreach ($operatingSystems as $os) {
                    $q->orWhere('products.operating_system', 'like', "%{$os}%");
                }
            });
        }
        if ($availability === 'in_stock') {
            $query->where('products.stock', '>', 0);
        } elseif ($availability === 'out_of_stock') {
            $query->where('products.stock', '<=', 0);
        }

        if ($offer == 1) {
            $query->where('products.is_offer', 1);
        }

        if ($home_budget == 1) {
            $query->where('products.home_budget', 1);
        }

        switch ($sort) {
            case 'price_low':
            case 'price_asc':
                $query->orderBy('products.price', 'asc');
                break;
            case 'price_high':
            case 'price_desc':
                $query->orderBy('products.price', 'desc');
                break;
            case 'popular':
                $query->orderBy('products.view_count', 'desc');
                break;
            case 'rating':
                $query->orderBy('products.id', 'desc');
                break;
            default:
                $query->orderBy('products.id', 'desc');
        }

        $products = $query->paginate($per_page);

        // Increment view counts for returned products
        if ($products->total() > 0) {
            foreach ($products->items() as $p) {
                Product::where('id', $p->id)->increment('view_count');
            }
        }

        return response()->json([
            "success" => true,
            "data" => $products,
        ]);
    }

    /**
     * GET /shop/products/{id}
     */
    public function show(Request $request, $id)
    {
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
            ->where('p.id', intval($id))
            ->where('p.is_deleted', 0)
            ->first();

        if (!$product) {
            return response()->json([
                "success" => false,
                "message" => "Product not found",
            ]);
        }

        Product::where('id', $product->id)->increment('view_count');

        return response()->json([
            "success" => true,
            "data" => $product,
        ]);
    }

    /**
     * GET /shop/products/filters
     */
    public function filters(Request $request)
    {
        $company_id  = intval($request->query('company_id', 1));
        $category_id = intval($request->query('category_id', 0));

        $base = Product::query()
            ->where('company_id', $company_id)
            ->where('is_deleted', 0)
            ->where('status', 'active');

        if ($category_id > 0) {
            $base->where('category_id', $category_id);
        }

        $brands = DB::table('brands')
            ->where('company_id', $company_id)
            ->where('is_deleted', 0)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $categories = DB::table('categories')
            ->where('company_id', $company_id)
            ->where('is_deleted', 0)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $productRows = (clone $base)->get(['price', 'processor', 'ram', 'storage', 'storage_type', 'condition_grade', 'operating_system']);

        $maxPrice = 1000000;
        $priceMax = $productRows->max('price');
        if ($priceMax > 0) {
            $maxPrice = ceil(floatval($priceMax));
        }

        $collect = function ($key) use ($productRows) {
            return $productRows->pluck($key)
                ->filter()
                ->map(fn($v) => trim((string) $v))
                ->filter(fn($v) => $v !== '')
                ->unique()
                ->values()
                ->all();
        };

        return response()->json([
            "success" => true,
            "data" => [
                "brands" => $brands,
                "categories" => $categories,
                "processors" => $collect('processor'),
                "rams" => $collect('ram'),
                "storages" => $collect('storage'),
                "storage_types" => $collect('storage_type'),
                "conditions" => $collect('condition_grade'),
                "operating_systems" => $collect('operating_system'),
                "price_range" => ["min" => 0, "max" => $maxPrice],
            ],
        ]);
    }

    /**
     * GET /shop/cart
     */
    public function cartIndex(Request $request)
    {
        $user_id = intval($request->query('user_id', 0));

        $items = DB::table('shop_carts as sc')
            ->leftJoin('products as p', 'sc.product_id', '=', 'p.id')
            ->select(
                'sc.id',
                'sc.user_id',
                'sc.product_id',
                'sc.quantity',
                'sc.price',
                'sc.size',
                'p.product_name',
                'p.image',
                'p.gst_percentage',
                'p.offer_price',
                'p.stock'
            )
            ->where('sc.user_id', $user_id)
            ->where('p.is_deleted', 0)
            ->orderBy('sc.id', 'desc')
            ->get();

        return response()->json([
            "success" => true,
            "data" => $items,
        ]);
    }

    /**
     * POST /shop/cart
     */
    public function cartStore(Request $request)
    {
        $user_id    = intval($request->input('user_id', 0));
        $product_id = intval($request->input('product_id', 0));
        $quantity   = max(1, intval($request->input('quantity', 1)));
        $price      = floatval($request->input('price', 0));
        $size       = trim($request->input('size', ''));

        if (!$user_id || !$product_id) {
            return response()->json(["success" => false, "message" => "User and Product required"]);
        }

        $product = Product::where('id', $product_id)->where('is_deleted', 0)->first();
        if (!$product) {
            return response()->json(["success" => false, "message" => "Product not found"]);
        }

        $existing = ShopCart::where('user_id', $user_id)
            ->where('product_id', $product_id)
            ->where('size', $size)
            ->first();

        if ($existing) {
            $newQty = $existing->quantity + $quantity;
            if ($product->stock !== null && $newQty > $product->stock) {
                $newQty = intval($product->stock);
            }
            $existing->update([
                'quantity' => $newQty,
                'price' => $price > 0 ? $price : $existing->price,
            ]);
        } else {
            ShopCart::create([
                'user_id' => $user_id,
                'product_id' => $product_id,
                'quantity' => $quantity,
                'price' => $price > 0 ? $price : ($product->offer_price ?: $product->price),
                'size' => $size ?: null,
            ]);
        }

        return response()->json([
            "success" => true,
            "message" => "Added to cart successfully",
        ]);
    }

    /**
     * POST /shop/cart/{id}
     */
    public function cartUpdate(Request $request, $id)
    {
        $user_id  = intval($request->input('user_id', 0));
        $quantity = max(1, intval($request->input('quantity', 1)));

        $item = ShopCart::where('id', intval($id))->where('user_id', $user_id)->first();
        if (!$item) {
            return response()->json(["success" => false, "message" => "Cart item not found"]);
        }

        $product = Product::find($item->product_id);
        if ($product && $product->stock !== null && $quantity > $product->stock) {
            $quantity = intval($product->stock);
        }

        $item->update(['quantity' => $quantity]);

        return response()->json([
            "success" => true,
            "message" => "Cart updated successfully",
        ]);
    }

    /**
     * DELETE /shop/cart/{id}
     */
    public function cartDestroy(Request $request, $id)
    {
        $user_id = intval($request->query('user_id', $request->input('user_id', 0)));
        ShopCart::where('id', intval($id))->where('user_id', $user_id)->delete();

        return response()->json([
            "success" => true,
            "message" => "Item removed from cart",
        ]);
    }

    /**
     * DELETE /shop/cart  (clear cart)
     */
    public function cartClear(Request $request)
    {
        $user_id = intval($request->query('user_id', $request->input('user_id', 0)));
        ShopCart::where('user_id', $user_id)->delete();

        return response()->json([
            "success" => true,
            "message" => "Cart cleared successfully",
        ]);
    }

    /**
     * GET /shop/wishlist
     */
    public function wishlistIndex(Request $request)
    {
        $user_id = intval($request->query('user_id', 0));

        $items = DB::table('shop_wishlists as sw')
            ->leftJoin('products as p', 'sw.product_id', '=', 'p.id')
            ->select(
                'sw.id',
                'sw.user_id',
                'sw.product_id',
                'sw.size',
                'p.product_name',
                'p.image',
                'p.price',
                'p.offer_price',
                'p.stock'
            )
            ->where('sw.user_id', $user_id)
            ->where('p.is_deleted', 0)
            ->orderBy('sw.id', 'desc')
            ->get();

        return response()->json([
            "success" => true,
            "data" => $items,
        ]);
    }

    /**
     * POST /shop/wishlist
     */
    public function wishlistStore(Request $request)
    {
        $user_id    = intval($request->input('user_id', 0));
        $product_id = intval($request->input('product_id', 0));
        $size       = trim($request->input('size', ''));

        if (!$user_id || !$product_id) {
            return response()->json(["success" => false, "message" => "User and Product required"]);
        }

        $exists = ShopWishlist::where('user_id', $user_id)
            ->where('product_id', $product_id)
            ->where('size', $size)
            ->first();

        if ($exists) {
            return response()->json([
                "success" => true,
                "message" => "Already in wishlist",
            ]);
        }

        ShopWishlist::create([
            'user_id' => $user_id,
            'product_id' => $product_id,
            'size' => $size ?: null,
        ]);

        return response()->json([
            "success" => true,
            "message" => "Added to wishlist",
        ]);
    }

    /**
     * DELETE /shop/wishlist/{id}
     */
    public function wishlistDestroy(Request $request, $id)
    {
        $user_id = intval($request->query('user_id', $request->input('user_id', 0)));
        ShopWishlist::where('id', intval($id))->where('user_id', $user_id)->delete();

        return response()->json([
            "success" => true,
            "message" => "Removed from wishlist",
        ]);
    }

    /**
     * POST /shop/checkout
     */
    public function checkout(Request $request)
    {
        $user_id          = intval($request->input('user_id', 0));
        $customer_name    = trim($request->input('customer_name', 'Customer'));
        $mobile           = trim($request->input('mobile', ''));
        $email            = trim($request->input('email', ''));
        $shipping_address = trim($request->input('shipping_address', ''));
        $billing_address  = trim($request->input('billing_address', '')) ?: $shipping_address;
        $payment_method   = trim($request->input('payment_method', 'cash'));
        $items            = $request->input('items', []);
        $sub_total        = floatval($request->input('subtotal', 0));
        $gst_total        = floatval($request->input('gst', 0));
        $grand_total      = floatval($request->input('grand_total', 0));

        if (count($items) == 0) {
            return response()->json(["success" => false, "message" => "No items in order"]);
        }

        if (!$customer_name || !$mobile) {
            return response()->json(["success" => false, "message" => "Customer name and mobile required"]);
        }

        $company_id = intval($request->input('company_id', 1));

        // Recalculate totals from items for consistency
        $calcSub = 0;
        $calcGst = 0;
        foreach ($items as $item) {
            $qty  = max(1, intval($item['quantity'] ?? 1));
            $prc  = floatval($item['price'] ?? 0);
            $gstP = floatval($item['gst_percentage'] ?? 0);
            $calcSub += $prc * $qty;
            $calcGst += ($prc * $qty * $gstP) / 100;
        }
        if ($sub_total <= 0) {
            $sub_total = $calcSub;
        }
        if ($gst_total <= 0) {
            $gst_total = $calcGst;
        }
        if ($grand_total <= 0) {
            $grand_total = $sub_total + $gst_total;
        }

        // Stock validation
        foreach ($items as $item) {
            $product_id = intval($item['product_id'] ?? 0);
            $qty        = intval($item['quantity'] ?? 1);
            $product    = Product::where('id', $product_id)->where('is_deleted', 0)->first();
            if (!$product) {
                return response()->json(["success" => false, "message" => "Invalid product in order"]);
            }
            if ($product->stock !== null && floatval($product->stock) < $qty) {
                return response()->json(["success" => false, "message" => "Insufficient stock for {$product->product_name}"]);
            }
        }

        $order_no   = "ORD-" . time() . "-" . rand(100, 999);
        $invoice_no = "INV-" . time() . "-" . rand(100, 999);

        DB::beginTransaction();
        try {
            $order = Order::create([
                'order_no' => $order_no,
                'invoice_no' => $invoice_no,
                'user_id' => $user_id > 0 ? $user_id : null,
                'customer_name' => $customer_name,
                'mobile' => $mobile,
                'email' => $email ?: null,
                'shipping_address' => $shipping_address,
                'billing_address' => $billing_address,
                'status' => 'pending',
                'payment_method' => $payment_method,
                'payment_status' => 'pending',
                'sub_total' => $sub_total,
                'gst_total' => $gst_total,
                'total_amount' => $grand_total,
                'paid_amount' => 0,
                'balance_amount' => $grand_total,
                'company_id' => $company_id,
                'created_at' => now(),
            ]);

            foreach ($items as $item) {
                $product_id = intval($item['product_id'] ?? 0);
                $qty        = max(1, intval($item['quantity'] ?? 1));
                $prc        = floatval($item['price'] ?? 0);
                $gstP       = floatval($item['gst_percentage'] ?? 0);
                $product    = Product::find($product_id);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product_id,
                    'product_name' => $product ? $product->product_name : "Product #{$product_id}",
                    'image' => $product ? $product->image : null,
                    'size' => ($item['size'] ?? '') ?: null,
                    'price' => $prc,
                    'quantity' => $qty,
                    'gst_percentage' => $gstP,
                    'total' => $prc * $qty,
                    'created_at' => now(),
                ]);

                Product::where('id', $product_id)->decrement('stock', $qty);
            }

            $payment = Payment::create([
                'company_id' => $company_id,
                'invoice_id' => $order->id,
                'invoice_no' => $invoice_no,
                'customer_id' => 0,
                'total_amount' => $grand_total,
                'paid_amount' => 0,
                'balance_amount' => $grand_total,
                'payment_method' => $payment_method,
                'payment_status' => 'not_paid',
                'notes' => 'Online shop order',
            ]);

            // Clear the user's cart after order placement
            if ($user_id > 0) {
                ShopCart::where('user_id', $user_id)->delete();
            }

            DB::commit();

            return response()->json([
                "success" => true,
                "message" => "Order placed successfully",
                "order_id" => $order->id,
                "invoice_no" => $invoice_no,
                "invoice_id" => $order->id,
                "payment_id" => $payment->id,
                "data" => [
                    "order_id" => $order->id,
                    "invoice_no" => $invoice_no,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "success" => false,
                "message" => $e->getMessage(),
            ]);
        }
    }

    /**
     * GET /shop/orders
     */
    public function orders(Request $request)
    {
        $user_id = intval($request->query('user_id', 0));

        if (!$user_id) {
            return response()->json(["success" => true, "data" => []]);
        }

        $orders = Order::where('user_id', $user_id)->orderBy('id', 'desc')->get();

        $data = $orders->map(function ($order) {
            $items = OrderItem::where('order_id', $order->id)->get();
            return [
                'id' => $order->id,
                'order_no' => $order->order_no,
                'invoice_no' => $order->invoice_no,
                'status' => $order->status,
                'payment_status' => $order->payment_status === 'paid' ? 'paid' : 'pending',
                'payment_method' => $order->payment_method,
                'created_at' => $order->created_at,
                'total' => $order->total_amount,
                'sub_total' => $order->sub_total,
                'gst_total' => $order->gst_total,
                'tracking_id' => $order->tracking_id,
                'shipped_at' => $order->shipped_at,
                'customer_name' => $order->customer_name,
                'mobile' => $order->mobile,
                'email' => $order->email,
                'shipping_address' => $order->shipping_address,
                'items' => $items->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'image' => $item->image,
                        'size' => $item->size,
                        'price' => $item->price,
                        'quantity' => $item->quantity,
                        'total' => $item->total,
                    ];
                }),
            ];
        });

        return response()->json([
            "success" => true,
            "data" => $data,
        ]);
    }

    /**
     * GET /shop/orders/{id}/invoice
     */
    public function orderInvoice(Request $request, $id)
    {
        $user_id = intval($request->query('user_id', 0));

        $order = Order::where('id', intval($id))->first();
        if (!$order) {
            return response()->json(["success" => false, "message" => "Invoice not found"]);
        }

        // Only allow the order owner to view it
        if ($user_id > 0 && $order->user_id && $order->user_id != $user_id) {
            return response()->json(["success" => false, "message" => "Unauthorized"]);
        }

        $company = Company::find($order->company_id) ?: Company::find(1);

        $items = OrderItem::where('order_id', $order->id)->get()->map(function ($item) {
            return [
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'size' => $item->size,
                'qty' => $item->quantity,
                'quantity' => $item->quantity,
                'price' => $item->price,
                'total' => $item->total,
                'gst_percentage' => $item->gst_percentage,
            ];
        });

        $data = [
            'id' => $order->id,
            'invoice_no' => $order->invoice_no,
            'order_no' => $order->order_no,
            'created_at' => $order->created_at,
            'payment_status' => $order->payment_status === 'paid' ? 'paid' : ($order->payment_status === 'partial' ? 'partial' : 'pending'),
            'payment_method' => $order->payment_method,
            'status' => $order->status,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->mobile,
            'mobile' => $order->mobile,
            'email' => $order->email,
            'shipping_address' => $order->shipping_address,
            'address' => $order->shipping_address,
            'sub_total' => $order->sub_total,
            'gst_total' => $order->gst_total,
            'total_amount' => $order->total_amount,
            'total' => $order->total_amount,
            'paid_amount' => $order->paid_amount,
            'balance_amount' => $order->balance_amount,
            'company_name' => $company ? $company->company_name : null,
            'company_address' => $company ? $company->company_address : null,
            'company_phone' => $company ? $company->phone : null,
            'company_email' => $company ? $company->owner_email : null,
            'company_gstin' => $company ? $company->gstin : null,
            'items' => $items,
        ];

        return response()->json([
            "success" => true,
            "data" => $data,
        ]);
    }

    /**
     * GET /shop/menu
     * Returns categories for the storefront header:
     * - header_categories: active categories shown directly in the nav
     * - shop_all: inactive categories listed inside the Shop All dropdown
     * Each category includes its active subcategories (subcategory is optional).
     */
    public function menu(Request $request)
    {
        $company_id = intval($request->query('company_id', 1));

        $categories = DB::table('categories as c')
            ->leftJoin('subcategories as sc', function ($join) use ($company_id) {
                $join->on('sc.category_id', '=', 'c.id')
                    ->where('sc.is_deleted', 0)
                    ->where('sc.status', 'active');
            })
            ->select(
                'c.id',
                'c.name',
                'c.company_id',
                'c.status',
                'sc.id as subcategory_id',
                'sc.name as subcategory_name'
            )
            ->where('c.company_id', $company_id)
            ->where('c.is_deleted', 0)
            ->orderBy('c.id')
            ->orderBy('sc.id')
            ->get();

        // Build parent-child structure
        $grouped = [];
        foreach ($categories as $row) {
            if (!isset($grouped[$row->id])) {
                $grouped[$row->id] = [
                    'id' => $row->id,
                    'name' => $row->name,
                    'status' => $row->status,
                    'subcategories' => [],
                ];
            }
            if ($row->subcategory_id !== null) {
                $grouped[$row->id]['subcategories'][] = [
                    'id' => $row->subcategory_id,
                    'name' => $row->subcategory_name,
                ];
            }
        }

        $all = array_values($grouped);
        $headerCategories = array_values(array_filter($all, fn($c) => $c['status'] === 'active'));
        $shopAll = array_values(array_filter($all, fn($c) => $c['status'] === 'inactive'));

        $brands = DB::table('brands')
            ->where('company_id', $company_id)
            ->where('status', 'active')
            ->where('is_deleted', 0)
            ->orderBy('name')
            ->get(['id', 'name']);

        $budgets = DB::table('budgets')
            ->where('company_id', $company_id)
            ->where('status', 'active')
            ->where('is_deleted', 0)
            ->orderBy('id')
            ->get(['id', 'name', 'min_price', 'max_price']);

        $professions = DB::table('professions')
            ->where('company_id', $company_id)
            ->where('status', 'active')
            ->where('is_deleted', 0)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json([
            "success" => true,
            "data" => [
                "header_categories" => $headerCategories,
                "shop_all" => $shopAll,
                "all_categories" => $all,
                "brands" => $brands,
                "budgets" => $budgets,
                "professions" => $professions,
            ],
        ]);
    }
}
