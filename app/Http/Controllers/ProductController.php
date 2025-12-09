<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        // Load products with ad performances, campaigns, and categories
        $products = Product::with(['adPerformances.campaign', 'adPerformances.category'])->get();

        $productData = $products->map(function ($product) {

            $performances = $product->adPerformances;

            // Handle products with no performances
            if ($performances->isEmpty()) {
                return [
                    'id' => $product->product_id,
                    'data' => [
                        'product_name' => $product->product_name,
                        'category' => '-',
                        'campaigns' => 0,
                        'average_roas' => 0,
                        'total_revenue' => 0,
                        'total_clicks' => 0,
                        'orders' => 0,
                        'ctr' => '0%',
                        'cvr' => '0%',
                        'campaign_start_date' => null,
                        'campaign_end_date' => null,
                    ],
                ];
            }

            // Aggregated metrics
            $totalRevenue = $performances->sum('sales_revenue');
            $totalClicks  = $performances->sum('clicks');
            $totalOrders  = $performances->sum('orders');
            $averageRoas  = $performances->avg('roas');
            $campaignCount = $performances->groupBy('campaign_id')->count();

            // All categories used by this product
            $categories = $performances->pluck('category.category_name')->filter()->unique()->values()->all();
            $categoryDisplay = count($categories) ? implode(', ', $categories) : '-';

            // Average CTR/CVR
            $averageCtr = $performances->avg('ctr') ? round($performances->avg('ctr'), 2) . '%' : '0%';
            $averageCvr = $performances->avg('cvr') ? round($performances->avg('cvr'), 2) . '%' : '0%';

            // ✅ Set campaign start and end dates for this product
            $startDate = $performances->min(fn($p) => $p->campaign->campaign_start_date ?? null);
            $endDate   = $performances->max(fn($p) => $p->campaign->campaign_end_date ?? null);

            return [
                'id' => $product->product_id,
                'data' => [
                    'product_name' => $product->product_name,
                    'category' => $categoryDisplay,
                    'campaigns' => $campaignCount,
                    'average_roas' => $averageRoas ? round($averageRoas, 2) : 0,
                    'total_revenue' => $totalRevenue ? number_format($totalRevenue, 2) : 0,
                    'total_clicks' => $totalClicks,
                    'orders' => $totalOrders,
                    'ctr' => $averageCtr,
                    'cvr' => $averageCvr,
                    'campaign_start_date' => $startDate,
                    'campaign_end_date' => $endDate,
                ],
            ];
        });

        // Return to Inertia view
        return Inertia::render('product', [
            'productData' => $productData,
        ]);
    }
}
