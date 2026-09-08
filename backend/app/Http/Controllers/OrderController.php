<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    private const ORDER_STATUSES = [
        'pending',
        'paid',
        'shipped',
        'completed',
        'cancelled',
    ];

    private const PAYMENT_METHOD = 'khqr';

    public function index(Request $request)
    {
        $orders = Order::query()
            ->where('user_id', Auth::id())
            ->with([
                'items.product:id,name,images',
                'payments',
                'address',
            ])
            ->latest('created_at')
            ->get();

        return response()->json($orders);
    }

    public function show(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403, 'This order does not belong to you.');
        }

        $order->load([
            'items.product:id,name,images',
            'payments',
            'address',
        ]);

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'address_id' => [
                'required',
                'integer',
                'exists:addresses,id',
            ],
        ]);

        $address = Address::query()
            ->where('id', $validated['address_id'])
            ->where('user_id', Auth::id())
            ->first();

        if (! $address) {
            throw ValidationException::withMessages([
                'address_id' => [
                    'Address not found or does not belong to you.',
                ],
            ]);
        }

        $cartItems = DB::table('cart_items')
            ->join(
                'carts',
                'carts.id',
                '=',
                'cart_items.cart_id'
            )
            ->join(
                'products',
                'products.id',
                '=',
                'cart_items.product_id'
            )
            ->where('carts.user_id', Auth::id())
            ->select(
                'cart_items.product_id',
                'cart_items.quantity',
                'products.name as product_name',
                'products.price',
                'products.discount',
                'products.stock'
            )
            ->get();

        if ($cartItems->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => [
                    'Your cart is empty.',
                ],
            ]);
        }

        foreach ($cartItems as $item) {
            if ($item->quantity <= 0) {
                throw ValidationException::withMessages([
                    'cart' => [
                        "{$item->product_name} has an invalid quantity.",
                    ],
                ]);
            }

            if ($item->quantity > $item->stock) {
                throw ValidationException::withMessages([
                    'cart' => [
                        "{$item->product_name} only has {$item->stock} left in stock.",
                    ],
                ]);
            }
        }

        $order = DB::transaction(function () use (
            $cartItems,
            $address
        ) {
            $total = $cartItems->sum(function ($item) {
                $price = (float) $item->price;
                $discount = (float) $item->discount;

                $unitPrice = $price - ($price * $discount / 100);

                return $unitPrice * $item->quantity;
            });

            $order = Order::create([
                'user_id' => Auth::id(),
                'address_id' => $address->id,
                'status' => 'pending',
                'payment_method' => self::PAYMENT_METHOD,
                'total' => round($total, 2),
            ]);

            foreach ($cartItems as $item) {
                $price = (float) $item->price;
                $discount = (float) $item->discount;

                $unitPrice = $price - ($price * $discount / 100);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'price' => round($unitPrice, 2),
                ]);

                DB::table('products')
                    ->where('id', $item->product_id)
                    ->decrement(
                        'stock',
                        $item->quantity
                    );
            }

            DB::table('cart_items')
                ->whereIn('cart_id', function ($query) {
                    $query->select('id')
                        ->from('carts')
                        ->where('user_id', Auth::id());
                })
                ->delete();

            return $order;
        });

        $order->load([
            'items.product:id,name,images',
            'payments',
            'address',
        ]);

        return response()->json($order, 201);
    }

    public function adminIndex(Request $request)
    {
        $validated = $request->validate([
            'status' => [
                'nullable',
                'string',
                'in:' . implode(',', self::ORDER_STATUSES),
            ],
            'search' => [
                'nullable',
                'string',
                'max:100',
            ],
            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $orders = Order::query()
            ->with([
                'user:id,name,email',
                'address',
                'items.product:id,name,images',
                'payments',
            ])
            ->when(
                ! empty($validated['status']),
                function ($query) use ($validated) {
                    $query->where(
                        'status',
                        $validated['status']
                    );
                }
            )
            ->when(
                ! empty($validated['search']),
                function ($query) use ($validated) {
                    $search = $validated['search'];

                    $query->where(function ($q) use ($search) {
                        $q->where(
                            'id',
                            'like',
                            "%{$search}%"
                        )->orWhereHas(
                            'user',
                            function ($uq) use ($search) {
                                $uq->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )->orWhere(
                                    'email',
                                    'like',
                                    "%{$search}%"
                                );
                            }
                        );
                    });
                }
            )
            ->latest('created_at')
            ->paginate(
                $validated['per_page'] ?? 15
            );

        return response()->json($orders);
    }

    public function updateStatus(
        Request $request,
        Order $order
    ) {
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:' . implode(',', self::ORDER_STATUSES),
            ],
        ]);

        $order->update([
            'status' => $validated['status'],
        ]);

        $order->load([
            'user:id,name,email',
            'address',
            'items.product:id,name,images',
            'payments',
        ]);

        return response()->json($order);
    }
}
