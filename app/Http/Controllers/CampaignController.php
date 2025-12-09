<?php

namespace App\Http\Controllers;

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
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        $file = $request->file('file');
        $sheets = Excel::toArray([], $file);

        if (empty($sheets) || count($sheets[0]) < 1) {
            return back()->with('error', 'Excel file is empty.');
        }

        $rows = $sheets[0];

        // Normalize headers
        $headers = array_map(fn($h) => Str::slug(trim($h), '_'), $rows[0]);
        $dataRows = array_slice($rows, 1);

        foreach ($dataRows as $row) {
            $rowData = array_combine($headers, $row);
            // -----------------------------------------------------------------------------------
            // 1️⃣ Vendor
            // -----------------------------------------------------------------------------------
            $vendor = null;
            if (!empty($rowData['vendor_id'])) {
                $vendor = Vendor::firstOrCreate(
                    ['vendor_id' => $rowData['vendor_id']],
                    ['vendor_name' => $rowData['vendor_name'] ?? null]
                );
            }

            // -----------------------------------------------------------------------------------
            // 2️⃣ Product
            // -----------------------------------------------------------------------------------
            $product = null;
            if (!empty($rowData['product_id'])) {
                $product = Product::firstOrCreate(
                    ['product_id' => $rowData['product_id']],
                    ['product_name' => $rowData['product_name'] ?? null]
                );
            }

            // -----------------------------------------------------------------------------------
            // 3️⃣ Campaign
            // -----------------------------------------------------------------------------------
            $campaign = null;
            if (!empty($rowData['campaign_name'])) {

                // Clean campaign name: remove everything after '('
                $cleanName = trim(explode('(', $rowData['campaign_name'])[0]);

                $campaign = Campaign::firstOrCreate(
                    [
                        'campaign_name' => $cleanName,
                        'campaign_id' => $rowData['campaign_id']
                    ],
                    [
                        'campaign_type' => $rowData['asset_type'] === 'AD_TYPE_SEARCH' ? 'SEARCH' : 'LISTING',
                        'campaign_start_date' => $rowData['campaign_start_date'] ?? null,
                        'campaign_end_date' => $rowData['campaign_end_date'] ?? null,
                    ]
                );
            }


            // Decide based on asset_type
            $isListing = !empty($rowData['asset_type']) && $rowData['asset_type'] === 'AD_TYPE_LISTING';
            $isSearch  = !empty($rowData['asset_type']) && $rowData['asset_type'] === 'AD_TYPE_SEARCH';

            // -----------------------------------------------------------------------------------
            // 4️⃣ IF LISTING → save category
            // -----------------------------------------------------------------------------------
            $categoryId = null;
            if ($isListing && !empty($rowData['category_name_l2'])) {

                $category = Category::firstOrCreate(
                    [
                        'category_id' => $rowData['category_id'],
                        'category_name' => $rowData['category_name_l2'],
                    ]
                );

                // Link campaign <-> category
                if ($campaign) {
                    $campaign->categories()->syncWithoutDetaching([$category->category_id]);
                }

                $categoryId = $category->category_id;
            }

            // -----------------------------------------------------------------------------------
            // 5️⃣ IF SEARCH → save keyword
            // -----------------------------------------------------------------------------------
            $keywordId = null;
            if ($isSearch && !empty($rowData['keyword'])) {

                $keyword = Keyword::firstOrCreate(
                    [
                        'keyword' => $rowData['keyword'],
                    ]
                );

                if ($campaign) {
                    $campaign->keywords()->syncWithoutDetaching([$keyword->keyword_id]);
                }

                $keywordId = $keyword->keyword_id;
            }

            // -----------------------------------------------------------------------------------
            // 6️⃣ Ad Performance SAVE — Correct FKs
            // -----------------------------------------------------------------------------------
            AdPerformance::create([
                'date' => $rowData['date'] ?? null,

                'product_id'   => $product?->product_id,
                'vendor_id'    => $vendor?->vendor_id,
                'campaign_id'  => $campaign?->campaign_id,

                'category_id'  => $categoryId,   // only filled for LISTING
                'keyword_id'   => $keywordId,    // only filled for SEARCH

                'impressions' => $rowData['impressions'] ?? null,
                'clicks' => $rowData['clicks'] ?? null,
                'orders' => $rowData['orders'] ?? null,
                'unit_sold' => $rowData['unit_sold'] ?? null,
                'ctr' => $rowData['ctr'] ?? null,
                'cvr' => $rowData['cvr'] ?? null,
                'avg_ad_position' => $rowData['average_ad_position'] ?? null,
                'sales_revenue' => $rowData['sales_revenue'] ?? null,
                'total_ad_spend' => $rowData['total_ad_spend'] ?? null,
                'cpa' => $rowData['cpa'] ?? null,
                'cpc' => $rowData['cpc'] ?? null,
                'roas' => $rowData['roas'] ?? null,
            ]);
        } // end foreach

        return redirect()->route('campaign.index')
            ->with('success', 'Excel imported successfully.');
    }
}
