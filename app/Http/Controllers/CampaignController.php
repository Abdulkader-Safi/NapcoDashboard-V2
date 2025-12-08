<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\UploadData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
// use App\Models\Product;
// use App\Models\Vendor;
// use App\Models\Keyword;
// use App\Models\Category;
// use App\Models\AdPerformance;
// use Illuminate\Support\Str;

class CampaignController extends Controller
{
    public function index()
    {
        $campaigns = Campaign::latest()->get();

        $campaignData = [];
        $allColumns = []; // Store all column headers

        foreach ($campaigns as $campaign) {
            $data = $campaign->data ?? [];
            if (!empty($data)) {
                // Get headers from first row of this campaign
                $headers = array_keys($data[0]);
                $allColumns = array_unique(array_merge($allColumns, $headers));

                // Store each campaign row
                foreach ($data as $row) {
                    $campaignData[] = [
                        'id' => $campaign->id,
                        'file_name' => $campaign->file_name,
                        'data' => $row,
                    ];
                }
            }
        }

        return Inertia::render('campaign/index', [
            'campaignData' => $campaignData,
            'columns' => $allColumns, // Pass headers dynamically
        ]);
    }

    // Show the upload page
    public function upload()
    {
        return Inertia::render('campaign/Upload');
    }



    // public function store(Request $request)
    // {
    //     $request->validate([
    //         'file' => 'required|mimes:xlsx,xls,csv',
    //     ]);

    //     $file = $request->file('file');

    //     // Read Excel as array
    //     $sheets = Excel::toArray([], $file);

    //     if (empty($sheets) || count($sheets[0]) < 1) {
    //         return back()->with('error', 'Excel file is empty.');
    //     }

    //     $rows = $sheets[0];

    //     // Get header row and normalize
    //     $headers = array_map(fn($h) => Str::slug(trim($h), '_'), $rows[0]);

    //     // Remove header row
    //     $dataRows = array_slice($rows, 1);

    //     foreach ($dataRows as $row) {
    //         $rowData = array_combine($headers, $row);

    //         // 1️⃣ Vendors
    //         $vendor = null;
    //         if (!empty($rowData['vendor_id'])) {
    //             $vendor = Vendor::firstOrCreate(
    //                 ['vendor_id' => $rowData['vendor_id']],
    //                 ['vendor_name' => $rowData['vendor_name'] ?? null]
    //             );
    //         }

    //         // 2️⃣ Products
    //         $product = null;
    //         if (!empty($rowData['product_id'])) {
    //             $product = Product::firstOrCreate(
    //                 ['product_id' => $rowData['product_id']],
    //                 ['product_name' => $rowData['product_name'] ?? null]
    //             );
    //         }

    //         // 3️⃣ Campaigns
    //         $campaign = null;
    //         if (!empty($rowData['campaign_name'])) {
    //             $campaign = Campaign::firstOrCreate(
    //                 ['campaign_name' => $rowData['campaign_name']],
    //                 [
    //                     'campaign_type' => $rowData['campaign_type'] ?? null,
    //                     'campaign_start_date' => $rowData['campaign_start_date'] ?? null,
    //                     'campaign_end_date' => $rowData['campaign_end_date'] ?? null,
    //                 ]
    //             );
    //         }

    //         // 4️⃣ Keywords (for SEARCH campaigns)
    //         $keyword = null;
    //         if (!empty($rowData['keyword']) && $campaign && $campaign->campaign_type === 'SEARCH') {
    //             $keyword = Keyword::firstOrCreate(
    //                 ['keyword' => $rowData['keyword']]
    //             );
    //             $campaign->keywords()->syncWithoutDetaching($keyword->keyword_id);
    //         }

    //         // 5️⃣ Categories (for LISTING campaigns)
    //         $category = null;
    //         if (!empty($rowData['category_name']) && $campaign && $campaign->campaign_type === 'LISTING') {
    //             $category = Category::firstOrCreate(
    //                 ['category_name' => $rowData['category_name']]
    //             );
    //             $campaign->categories()->syncWithoutDetaching($category->category_id);
    //         }

    //         // 6️⃣ Ad Performance
    //         AdPerformance::create([
    //             'date' => $rowData['date'] ?? null,
    //             'product_id' => $product?->product_id,
    //             'vendor_id' => $vendor?->vendor_id,
    //             'campaign_id' => $campaign?->campaign_id,
    //             'keyword_id' => $keyword?->keyword_id,
    //             'category_id' => $category?->category_id,
    //             'impressions' => $rowData['impressions'] ?? null,
    //             'clicks' => $rowData['clicks'] ?? null,
    //             'orders' => $rowData['orders'] ?? null,
    //             'unit_sold' => $rowData['unit_sold'] ?? null,
    //             'ctr' => $rowData['ctr'] ?? null,
    //             'cvr' => $rowData['cvr'] ?? null,
    //             'avg_ad_position' => $rowData['avg_ad_position'] ?? null,
    //             'sales_revenue' => $rowData['sales_revenue'] ?? null,
    //             'total_ad_spend' => $rowData['total_ad_spend'] ?? null,
    //             'cpa' => $rowData['cpa'] ?? null,
    //             'cpc' => $rowData['cpc'] ?? null,
    //             'roas' => $rowData['roas'] ?? null,
    //         ]);
    //     }

    //     return redirect()->route('campaign.index')
    //         ->with('success', 'Excel imported successfully.');
    // }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();

        $sheets = Excel::toArray([], $file);

        if (empty($sheets) || count($sheets[0]) < 1) {
            return back()->with('error', 'Excel file is empty.');
        }

        $rows = $sheets[0];
        $headers = array_map(fn($h) => \Str::slug(trim($h), '_'), $rows[0]);
        $dataRows = array_slice($rows, 1);

        // Get existing columns in the table
        $existingColumns = Schema::getColumnListing('upload_data');

        // Add missing columns dynamically
        Schema::table('upload_data', function (Blueprint $table) use ($headers, $existingColumns) {
            foreach ($headers as $header) {
                if (!in_array($header, $existingColumns)) {
                    $table->text($header)->nullable();
                }
            }
        });

        // Insert data row by row
        foreach ($dataRows as $row) {
            $record = ['file_name' => $fileName];
            foreach ($headers as $index => $column) {
                $record[$column] = $row[$index] ?? null;
            }
            \App\Models\UploadData::create($record);
        }

        return redirect()->route('campaign.index')
            ->with('success', 'Imported successfully.');
    }
}
