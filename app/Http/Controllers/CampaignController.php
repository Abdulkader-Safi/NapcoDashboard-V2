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
        // Load campaigns with ad performances + products
        $campaigns = Campaign::with([
            'adPerformances.product',
            'adPerformances.category',
        ])->latest()->get();

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
                    ],
                ];
            }

            $totalRevenue = $performances->sum('sales_revenue');
            $totalClicks  = $performances->sum('clicks');
            $totalOrders  = $performances->sum('orders');
            $averageRoas  = $performances->avg('roas');

            // Count of unique products in this campaign
            $productCount = $performances->pluck('product.product_name')->filter()->unique()->count();

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
                ],
            ];
        });

        return Inertia::render('campaign/index', [
            'campaignData' => $campaignData,
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
