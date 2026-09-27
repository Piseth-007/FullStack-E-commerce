<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Subscriber;
use App\Models\CartItem;
use App\Models\Favorite;
use App\Mail\NewProductAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = $this->buildFilteredQuery($request);

        return response()->json(
            $query
                ->paginate(12)
                ->withQueryString()
        );
    }

    public function adminIndex(Request $request)
    {
        $query = Product::query()
            ->select([
                'id',
                'category_id',
                'brand_id',
                'name',
                'slug',
                'price',
                'discount',
                'free_delivery',
                'stock',
                'images',
                'created_at',
                'updated_at',
            ])
            ->with([
                'category:id,name,slug',
                'brand:id,name,slug',
            ])
            ->latest('created_at');

        return response()->json($query->get());
    }

    protected function buildFilteredQuery(Request $request)
    {
        $query = Product::with([
            'category:id,name,slug',
            'brand:id,name,slug',
            'skinTypes:id,name',
        ])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $cat = $request->category_id;
            if (!is_numeric($cat)) {
                $query->whereHas('category', function ($q) use ($cat) {
                    $q->where('slug', $cat);
                });
            } else {
                $query->where('category_id', $cat);
            }
        } elseif ($request->filled('category')) {
            $cat = $request->category;
            $query->whereHas('category', function ($q) use ($cat) {
                if (is_numeric($cat)) {
                    $q->where('id', $cat);
                } else {
                    $q->where('slug', $cat);
                }
            });
        }

        if ($request->filled('brand_id')) {
            $brand = $request->brand_id;
            if (!is_numeric($brand)) {
                $query->whereHas('brand', function ($q) use ($brand) {
                    $q->where('slug', $brand);
                });
            } else {
                $query->where('brand_id', $brand);
            }
        } elseif ($request->filled('brand')) {
            $brand = $request->brand;
            $query->whereHas('brand', function ($q) use ($brand) {
                if (is_numeric($brand)) {
                    $q->where('id', $brand);
                } else {
                    $q->where('slug', $brand);
                }
            });
        }

        if ($request->filled('skin_type_id')) {
            $query->whereHas('skinTypes', function ($q) use ($request) {
                $q->where(
                    'skin_types.id',
                    $request->skin_type_id
                );
            });
        }

        if ($request->filled('skin_type_ids')) {
            $skinTypeIds = $request->skin_type_ids;

            if (!is_array($skinTypeIds)) {
                $skinTypeIds = explode(',', $skinTypeIds);
            }

            $query->whereHas('skinTypes', function ($q) use ($skinTypeIds) {
                $q->whereIn(
                    'skin_types.id',
                    $skinTypeIds
                );
            });
        }

        if ($request->has('free_delivery')) {
            $query->where(
                'free_delivery',
                $request->boolean('free_delivery')
            );
        }

        if ($request->boolean('has_discount')) {
            $query->where('discount', '>', 0);
        }

        if ($request->boolean('has_rating')) {
            $query->whereHas('reviews');
        }

        if ($request->filled('min_price')) {
            $query->where(
                'price',
                '>=',
                $request->min_price
            );
        }

        if ($request->filled('max_price')) {
            $query->where(
                'price',
                '<=',
                $request->max_price
            );
        }

        switch ($request->get('sort')) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;

            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;

            case 'rating':
                $query->orderByDesc(
                    'reviews_avg_rating'
                );
                break;

            case 'discount':
                $query->orderByDesc('discount');
                break;

            case 'oldest':
                $query->oldest();
                break;

            case 'latest_updated':
            case 'updated':
                $query->latest('updated_at');
                break;

            default:
                $query->latest();
                break;
        }

        return $query;
    }

    public function show(Product $product)
    {
        $product->load([
            'category:id,name,slug',
            'brand:id,name,slug',
            'skinTypes:id,name',
        ])
            ->loadAvg('reviews', 'rating')
            ->loadCount('reviews');

        $product->reviews_avg_rating = round(
            $product->reviews_avg_rating ?? 0,
            1
        );

        $product->reviews_count = (int) ($product->reviews_count ?? 0);

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',

            'name' => 'required|string|max:255',
            'description' => 'nullable|string',

            'price' => 'required|numeric|min:0',

            'discount' => 'nullable|numeric|min:0|max:100',

            'free_delivery' => 'nullable|boolean',

            'stock' => 'required|integer|min:0',

            'skin_type_ids' => 'nullable|array',
            'skin_type_ids.*' => 'exists:skin_types,id',
        ]);

        $skinTypeIds =
            $validated['skin_type_ids'] ?? [];

        unset($validated['skin_type_ids']);

        $validated['discount'] =
            $validated['discount'] ?? 0;

        $validated['free_delivery'] =
            $validated['free_delivery'] ?? false;

        $product = Product::create([
            ...$validated,
            'slug' =>
            Str::slug($validated['name'])
                . '-'
                . Str::random(6),
        ]);

        $product->skinTypes()->sync(
            $skinTypeIds
        );

        $product->load([
            'category',
            'brand',
            'skinTypes',
        ]);

        // Queue notification to subscribed customers
        try {
            $subscribers = Subscriber::where('is_active', true)->pluck('email');
            if ($subscribers->isNotEmpty()) {
                foreach ($subscribers as $subscriberEmail) {
                    try {
                        Mail::to($subscriberEmail)->queue(new NewProductAlert($product));
                    } catch (\Throwable $mailErr) {
                        Log::warning("Could not queue new product email to {$subscriberEmail}: " . $mailErr->getMessage());
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error("Failed to notify subscribers about new product {$product->id}: " . $e->getMessage());
        }

        Cache::forget('dashboard:summary:all_time');

        return response()->json([
            'message' =>
            'Product created successfully',
            'data' => $product,
        ], 201);
    }

    public function update(
        Request $request,
        Product $product
    ) {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',

            'name' => 'required|string|max:255',
            'description' => 'nullable|string',

            'price' => 'required|numeric|min:0',

            'discount' => 'nullable|numeric|min:0|max:100',

            'free_delivery' => 'nullable|boolean',

            'stock' => 'required|integer|min:0',

            'skin_type_ids' => 'nullable|array',
            'skin_type_ids.*' => 'exists:skin_types,id',
        ]);

        $skinTypeIds =
            $validated['skin_type_ids'] ?? [];

        unset($validated['skin_type_ids']);

        $validated['discount'] =
            $validated['discount'] ?? 0;

        $validated['free_delivery'] =
            $validated['free_delivery'] ?? false;

        $product->update($validated);

        $product->skinTypes()->sync(
            $skinTypeIds
        );

        $product->load([
            'category',
            'brand',
            'skinTypes',
        ]);

        Cache::forget('dashboard:summary:all_time');

        return response()->json([
            'message' =>
            'Product updated successfully',
            'data' => $product,
        ]);
    }

    public function destroy(Product $product)
    {
        try {
            // Clean up active shopping carts and favorites for this product
            CartItem::where('product_id', $product->id)->delete();
            Favorite::where('product_id', $product->id)->delete();

            // Soft-delete the product (marks deleted_at timestamp)
            // Preserves image assets and order history
            $product->delete();

            Cache::forget('dashboard:summary:all_time');

            return response()->json([
                'message' => 'Product deleted successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error("Failed to soft-delete product {$product->id}: " . $e->getMessage());

            return response()->json([
                'message' => 'Failed to delete product. ' . $e->getMessage(),
            ], 500);
        }
    }
}
