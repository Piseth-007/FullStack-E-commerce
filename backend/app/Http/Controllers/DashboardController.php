<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary()
    {
        $todayStart = today()->startOfDay()->toDateTimeString();
        $todayEnd = today()->endOfDay()->toDateTimeString();
        $weekStart = now()->startOfWeek()->startOfDay()->toDateTimeString();
        $weekEnd = now()->endOfWeek()->endOfDay()->toDateTimeString();

        $orderStats = DB::table('orders')
            ->selectRaw("
                COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as total_sales,
                COUNT(*) as total_orders,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as orders_pending,
                COALESCE(SUM(CASE WHEN status != 'cancelled' AND created_at BETWEEN ? AND ? THEN total ELSE 0 END), 0) as sales_today,
                COUNT(CASE WHEN created_at BETWEEN ? AND ? THEN 1 END) as orders_this_week
            ", [$todayStart, $todayEnd, $weekStart, $weekEnd])
            ->first();

        $productStats = DB::table('products')
            ->selectRaw("
                COUNT(*) as total_products,
                COUNT(CASE WHEN stock <= 5 THEN 1 END) as low_stock_products
            ")
            ->first();

        $totalCustomers = DB::table('users')
            ->where('role', 'customer')
            ->count();

        return response()->json([
            'total_sales' => (float) ($orderStats->total_sales ?? 0),
            'total_orders' => (int) ($orderStats->total_orders ?? 0),
            'orders_pending' => (int) ($orderStats->orders_pending ?? 0),
            'total_products' => (int) ($productStats->total_products ?? 0),
            'low_stock_products' => (int) ($productStats->low_stock_products ?? 0),
            'total_customers' => (int) $totalCustomers,
            'sales_today' => (float) ($orderStats->sales_today ?? 0),
            'orders_this_week' => (int) ($orderStats->orders_this_week ?? 0),
        ]);
    }

    public function salesTrend(Request $request)
    {
        $range = $request->get('range', '14d');

        if ($range === '12m') {
            $startDate = now()->subMonths(11)->startOfMonth()->startOfDay()->toDateTimeString();
            $endDate = now()->endOfMonth()->endOfDay()->toDateTimeString();

            $monthAggregates = DB::table('orders')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw("
                    DATE_FORMAT(created_at, '%Y-%m') as month_key,
                    COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as sales,
                    COUNT(*) as orders
                ")
                ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
                ->get()
                ->keyBy('month_key');

            $data = collect(range(11, 0))->map(function ($monthsAgo) use ($monthAggregates) {
                $date = now()->subMonths($monthsAgo);
                $key = $date->format('Y-m');
                $agg = $monthAggregates->get($key);

                return [
                    'label' => $date->format('M Y'),
                    'sales' => (float) ($agg->sales ?? 0),
                    'orders' => (int) ($agg->orders ?? 0),
                ];
            });

            return response()->json($data);
        }

        $days = match ($range) {
            '7d' => 6,
            '30d' => 29,
            default => 13, // 14d
        };

        $startDate = now()->subDays($days)->startOfDay()->toDateTimeString();
        $endDate = now()->endOfDay()->toDateTimeString();

        $dayAggregates = DB::table('orders')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw("
                DATE(created_at) as date_key,
                COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as sales,
                COUNT(*) as orders
            ")
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get()
            ->keyBy(fn($item) => (string) $item->date_key);

        $data = collect(range($days, 0))->map(function ($daysAgo) use ($dayAggregates) {
            $date = now()->subDays($daysAgo);
            $dateStr = $date->toDateString();
            $agg = $dayAggregates->get($dateStr);

            return [
                'label' => $date->format('M j'),
                'sales' => (float) ($agg->sales ?? 0),
                'orders' => (int) ($agg->orders ?? 0),
            ];
        });

        return response()->json($data);
    }
}
