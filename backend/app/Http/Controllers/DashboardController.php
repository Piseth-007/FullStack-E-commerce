<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        // If date filter is provided
        if ($startDate || $endDate) {
            $start = $startDate ? Carbon::parse($startDate)->startOfDay() : null;
            $end = $endDate ? Carbon::parse($endDate)->endOfDay() : null;

            if ($start && $end && $start->gt($end)) {
                [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
            }

            $orderQuery = DB::table('orders');
            if ($start) {
                $orderQuery->where('created_at', '>=', $start->toDateTimeString());
            }
            if ($end) {
                $orderQuery->where('created_at', '<=', $end->toDateTimeString());
            }

            $orderStats = (clone $orderQuery)
                ->selectRaw("
                    COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as total_sales,
                    COUNT(*) as total_orders,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as orders_pending
                ")
                ->first();

            // Calculate growth compared to previous period of identical duration
            $salesGrowth = null;
            $ordersGrowth = null;

            if ($start && $end) {
                $durationInSeconds = $end->diffInSeconds($start);
                $prevEnd = $start->copy()->subSecond();
                $prevStart = $prevEnd->copy()->subSeconds($durationInSeconds);

                $prevStats = DB::table('orders')
                    ->whereBetween('created_at', [$prevStart->toDateTimeString(), $prevEnd->toDateTimeString()])
                    ->selectRaw("
                        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as total_sales,
                        COUNT(*) as total_orders
                    ")
                    ->first();

                $currSales = (float) ($orderStats->total_sales ?? 0);
                $prevSales = (float) ($prevStats->total_sales ?? 0);
                if ($prevSales > 0) {
                    $salesGrowth = round((($currSales - $prevSales) / $prevSales) * 100, 1);
                } elseif ($currSales > 0) {
                    $salesGrowth = 100.0;
                } else {
                    $salesGrowth = 0.0;
                }

                $currOrders = (int) ($orderStats->total_orders ?? 0);
                $prevOrders = (int) ($prevStats->total_orders ?? 0);
                if ($prevOrders > 0) {
                    $ordersGrowth = round((($currOrders - $prevOrders) / $prevOrders) * 100, 1);
                } elseif ($currOrders > 0) {
                    $ordersGrowth = 100.0;
                } else {
                    $ordersGrowth = 0.0;
                }
            }

            // Customers count active in this range
            $customerQuery = DB::table('orders');
            if ($start) {
                $customerQuery->where('created_at', '>=', $start->toDateTimeString());
            }
            if ($end) {
                $customerQuery->where('created_at', '<=', $end->toDateTimeString());
            }
            $periodCustomers = $customerQuery->whereNotNull('user_id')->distinct('user_id')->count('user_id');

            $productStats = DB::table('products')
                ->selectRaw("
                    COUNT(*) as total_products,
                    COUNT(CASE WHEN stock <= 5 THEN 1 END) as low_stock_products
                ")
                ->first();

            return response()->json([
                'total_sales' => (float) ($orderStats->total_sales ?? 0),
                'total_orders' => (int) ($orderStats->total_orders ?? 0),
                'orders_pending' => (int) ($orderStats->orders_pending ?? 0),
                'total_products' => (int) ($productStats->total_products ?? 0),
                'low_stock_products' => (int) ($productStats->low_stock_products ?? 0),
                'total_customers' => (int) $periodCustomers,
                'sales_growth' => $salesGrowth,
                'orders_growth' => $ordersGrowth,
                'is_filtered' => true,
                'start_date' => $start?->toDateString(),
                'end_date' => $end?->toDateString(),
            ]);
        }

        // All-Time Summary (Default)
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

        // Previous week vs this week growth
        $prevWeekStart = now()->subWeek()->startOfWeek()->startOfDay()->toDateTimeString();
        $prevWeekEnd = now()->subWeek()->endOfWeek()->endOfDay()->toDateTimeString();

        $prevWeekSales = (float) (DB::table('orders')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$prevWeekStart, $prevWeekEnd])
            ->sum('total') ?? 0);

        $thisWeekSales = (float) (DB::table('orders')
            ->where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$weekStart, $weekEnd])
            ->sum('total') ?? 0);

        $salesGrowth = null;
        if ($prevWeekSales > 0) {
            $salesGrowth = round((($thisWeekSales - $prevWeekSales) / $prevWeekSales) * 100, 1);
        } elseif ($thisWeekSales > 0) {
            $salesGrowth = 100.0;
        }

        return response()->json([
            'total_sales' => (float) ($orderStats->total_sales ?? 0),
            'total_orders' => (int) ($orderStats->total_orders ?? 0),
            'orders_pending' => (int) ($orderStats->orders_pending ?? 0),
            'total_products' => (int) ($productStats->total_products ?? 0),
            'low_stock_products' => (int) ($productStats->low_stock_products ?? 0),
            'total_customers' => (int) $totalCustomers,
            'sales_today' => (float) ($orderStats->sales_today ?? 0),
            'orders_this_week' => (int) ($orderStats->orders_this_week ?? 0),
            'sales_growth' => $salesGrowth,
            'is_filtered' => false,
        ]);
    }

    public function salesTrend(Request $request)
    {
        $range = $request->get('range', '7d');
        $startDateInput = $request->get('start_date');
        $endDateInput = $request->get('end_date');

        // Check if custom start/end date range is provided
        if ($startDateInput && $endDateInput) {
            $start = Carbon::parse($startDateInput)->startOfDay();
            $end = Carbon::parse($endDateInput)->endOfDay();

            if ($start->gt($end)) {
                [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
            }

            // Case 1: Single day (e.g. 2026-09-08 to 2026-09-08) -> group by hour
            if ($start->isSameDay($end)) {
                $hourAggregates = DB::table('orders')
                    ->whereBetween('created_at', [$start->toDateTimeString(), $end->toDateTimeString()])
                    ->selectRaw("
                        DATE_FORMAT(created_at, '%H:00') as hour_key,
                        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as sales,
                        COUNT(*) as orders
                    ")
                    ->groupBy(DB::raw("DATE_FORMAT(created_at, '%H:00')"))
                    ->get()
                    ->keyBy('hour_key');

                $data = collect(range(0, 23))->map(function ($hour) use ($hourAggregates) {
                    $key = sprintf('%02d:00', $hour);
                    $agg = $hourAggregates->get($key);

                    return [
                        'label' => $key,
                        'sales' => (float) ($agg->sales ?? 0),
                        'orders' => (int) ($agg->orders ?? 0),
                    ];
                });

                return response()->json($data);
            }

            $daysDiff = $start->diffInDays($end);

            // Case 2: Multi-day <= 90 days -> group by day
            if ($daysDiff <= 90) {
                $dayAggregates = DB::table('orders')
                    ->whereBetween('created_at', [$start->toDateTimeString(), $end->toDateTimeString()])
                    ->selectRaw("
                        DATE(created_at) as date_key,
                        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as sales,
                        COUNT(*) as orders
                    ")
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->get()
                    ->keyBy(fn($item) => (string) $item->date_key);

                $data = collect();
                $curr = $start->copy();
                while ($curr->lte($end)) {
                    $dateStr = $curr->toDateString();
                    $agg = $dayAggregates->get($dateStr);
                    $data->push([
                        'label' => $curr->format('M j'),
                        'date' => $dateStr,
                        'sales' => (float) ($agg->sales ?? 0),
                        'orders' => (int) ($agg->orders ?? 0),
                    ]);
                    $curr->addDay();
                }

                return response()->json($data);
            }

            // Case 3: Range > 90 days -> group by month
            $monthAggregates = DB::table('orders')
                ->whereBetween('created_at', [$start->toDateTimeString(), $end->toDateTimeString()])
                ->selectRaw("
                    DATE_FORMAT(created_at, '%Y-%m') as month_key,
                    COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as sales,
                    COUNT(*) as orders
                ")
                ->groupBy(DB::raw("DATE_FORMAT(created_at, '%Y-%m')"))
                ->get()
                ->keyBy('month_key');

            $data = collect();
            $curr = $start->copy()->startOfMonth();
            while ($curr->lte($end)) {
                $key = $curr->format('Y-m');
                $agg = $monthAggregates->get($key);
                $data->push([
                    'label' => $curr->format('M Y'),
                    'month' => $key,
                    'sales' => (float) ($agg->sales ?? 0),
                    'orders' => (int) ($agg->orders ?? 0),
                ]);
                $curr->addMonth();
            }

            return response()->json($data);
        }

        // Standard presets
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
            '30d' => 29,
            '14d' => 13,
            default => 6, // 7d
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
