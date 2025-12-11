<?php

namespace App\Http\Controllers;

use App\Imports\FastAdPerformanceImport;
use App\Models\Campaign;
use App\Models\UploadData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use App\Models\Product;
use App\Models\Vendor;
use App\Models\Keyword;
use App\Models\Category;
use App\Models\AdPerformance;
use Illuminate\Support\Str;

class CampaignController extends Controller
{
    public function index()
    {
        $campaigns = Campaign::with(['adPerformances.product', 'adPerformances.category'])
            ->latest()
            ->get();

        $campaignData = $campaigns->map(function ($campaign) {
            $performances = $campaign->adPerformances;

            if ($performances->isEmpty()) {
                return [
                    'id' => $campaign->campaign_id,
                    'data' => [
                        'campaign_name' => $campaign->campaign_name,
                        'roas' => 0,
                        'product_count' => 0,
                        'campaign_start_date' => $campaign->campaign_start_date,
                        'campaign_end_date' => $campaign->campaign_end_date,
                        'sales_revenue' => 0,
                        'clicks' => 0,
                        'orders' => 0,
                        'products' => [],
                    ],
                ];
            }

            $totalRevenue = $performances->sum('sales_revenue');
            $totalClicks  = $performances->sum('clicks');
            $totalOrders  = $performances->sum('orders');
            $averageRoas  = $performances->avg('roas');

            // Count of unique products
            $productCount = $performances->pluck('product.product_name')->filter()->unique()->count();

            $productList = $performances->map(fn($perf) => $perf->product)
                ->filter()
                ->unique('product_id')
                ->map(fn($prod) => [
                    'id' => $prod->product_id ?? $prod->id,
                    'product_name' => $prod->product_name,
                ])
                ->values();

            return [
                'id' => $campaign->campaign_id,
                'data' => [
                    'campaign_name' => $campaign->campaign_name,
                    'roas' => $averageRoas ? round($averageRoas, 2) : 0,
                    'product_count' => $productCount,
                    'campaign_start_date' => $campaign->campaign_start_date,
                    'campaign_end_date' => $campaign->campaign_end_date,
                    'sales_revenue' => $totalRevenue ? number_format($totalRevenue, 2) : 0,
                    'clicks' => $totalClicks,
                    'orders' => $totalOrders,
                    'products' => $productList,
                ],
            ];
        });

        return Inertia::render('campaign/index', [
            'campaignData' => $campaignData,
        ]);
    }

    public function products($id)
    {
        $performances = Campaign::with('adPerformances.product')->where('campaign_id', $id)->first();

        $products = $performances->adPerformances
            ->pluck('product.product_name')
            ->filter()
            ->unique()
            ->values();
        // dd($products);
        return Inertia::render('product_detail', [
            'campaignName' => $performances->campaign_name,
            'products' => $products,
        ]);
    }


    // Show the upload page
    public function upload()
    {
        return Inertia::render('campaign/Upload');
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::queueImport(new FastAdPerformanceImport, $request->file('file'));

        $updatedCampaigns = Campaign::where('updated_at', '>=', now()->subMinutes(1))
            ->pluck('campaign_name', 'campaign_id');

        return redirect()->route('campaign.index')
            ->with('success', 'File uploaded and is being processed in background.')
            ->with('updatedCampaigns', $updatedCampaigns->toArray());
    }
}
