<?php

namespace App\Http\Controllers;

use App\Models\keyword;
use App\Models\Keyword as ModelsKeyword;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KeywordController extends Controller
{
    public function index()
    {
        // Load keywords with ad performances, campaigns, and categories
        $keywords = Keyword::with(['adPerformances.campaign', 'adPerformances.category', 'adPerformances.product'])->get();

        $keywordData = $keywords->map(function ($keyword) {

            $performances = $keyword->adPerformances;

            if ($performances->isEmpty()) {
                return [
                    'id' => $keyword->id,
                    'data' => [
                        'keyword_name' => $keyword->keyword,
                        'category' => '-',
                        'campaigns' => 0,
                        'average_roas' => 0,
                        'total_revenue' => 0,
                        'total_clicks' => 0,
                        'orders' => 0,
                        'ctr' => '0%',
                        'cvr' => '0%',
                        'impressions' => 0,
                        'product_count' => 0,
                        'avg_cpc' => 0,
                        // ✅ Add these for filtering
                        'campaign_start_date' => null,
                        'campaign_end_date' => null,
                    ],
                ];
            }

            $totalRevenue   = $performances->sum('sales_revenue');
            $totalClicks    = $performances->sum('clicks');
            $totalOrders    = $performances->sum('orders');
            $totalImpressions = $performances->sum('impressions');
            $averageRoas    = $performances->avg('roas');
            $campaignCount  = $performances->groupBy('campaign_id')->count();
            $avgCpc         = $performances->avg('cpc'); // average CPC

            $products = $performances->pluck('product.product_name')->filter()->unique()->values()->all();

            $categories = $performances->pluck('category.category_name')->filter()->unique()->values()->all();
            $categoryDisplay = count($categories) ? implode(', ', $categories) : '-';

            $averageCtr = $performances->avg('ctr') ? round($performances->avg('ctr'), 2) . '%' : '0%';
            $averageCvr = $performances->avg('cvr') ? round($performances->avg('cvr'), 2) . '%' : '0%';

            // ✅ Determine campaign start/end dates for the keyword
            $startDate = $performances->min(fn($p) => $p->campaign->campaign_start_date ?? null);
            $endDate   = $performances->max(fn($p) => $p->campaign->campaign_end_date ?? null);

            return [
                'id' => $keyword->id,
                'data' => [
                    'keyword_name' => $keyword->keyword,
                    'category' => $categoryDisplay,
                    'campaigns' => $campaignCount,
                    'average_roas' => $averageRoas ? round($averageRoas, 2) : 0,
                    'total_revenue' => $totalRevenue ? number_format($totalRevenue, 2) : 0,
                    'total_clicks' => $totalClicks,
                    'orders' => $totalOrders,
                    'ctr' => $averageCtr,
                    'cvr' => $averageCvr,
                    'impressions' => $totalImpressions,
                    'product_count' => count($products),
                    'avg_cpc' => $avgCpc ? number_format($avgCpc, 2) : 0,
                    'campaign_start_date' => $startDate,
                    'campaign_end_date' => $endDate,
                ],
            ];
        });

        return Inertia::render('keywords', [
            'keywordData' => $keywordData,
        ]);
    }
}
