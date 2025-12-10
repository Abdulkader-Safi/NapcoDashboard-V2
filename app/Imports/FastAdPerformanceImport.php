<?php

namespace App\Imports;

use App\Models\Vendor;
use App\Models\Product;
use App\Models\Campaign;
use App\Models\Category;
use App\Models\Keyword;
use App\Models\AdPerformance;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Queue\ShouldQueue;

use Maatwebsite\Excel\Row;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class FastAdPerformanceImport implements
    OnEachRow,
    WithHeadingRow,
    WithChunkReading,
    ShouldQueue
{
    protected array $vendors = [];
    protected array $products = [];
    protected array $campaigns = [];
    protected array $categories = [];
    protected array $keywords = [];

    protected array $batch = [];
    protected int $batchSize = 500;

    public function __construct()
    {
        // Preload existing IDs to avoid repeated queries
        $this->vendors = Vendor::pluck('vendor_id')->flip()->toArray();
        $this->products = Product::pluck('product_id')->flip()->toArray();
        $this->campaigns = Campaign::pluck('campaign_id')->flip()->toArray();
        $this->categories = Category::pluck('category_id')->flip()->toArray();
        $this->keywords = Keyword::pluck('keyword')->flip()->toArray();
    }

    public function onRow(Row $row)
    {
        $rowData = $row->toArray();

        // Normalize headers
        $rowData = array_combine(
            array_map(fn($h) => Str::slug($h, '_'), array_keys($rowData)),
            array_values($rowData)
        );

        $now = now(); // timestamp for all tables

        // ---------------- Vendor ----------------
        if (!empty($rowData['vendor_id']) && !isset($this->vendors[$rowData['vendor_id']])) {
            Vendor::insertOrIgnore([[
                'vendor_id' => $rowData['vendor_id'],
                'vendor_name' => $rowData['vendor_name'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ]]);
            $this->vendors[$rowData['vendor_id']] = true;
        }

        // ---------------- Product ----------------
        if (!empty($rowData['product_id']) && !isset($this->products[$rowData['product_id']])) {
            Product::insertOrIgnore([[
                'product_id' => $rowData['product_id'],
                'product_name' => $rowData['product_name'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ]]);
            $this->products[$rowData['product_id']] = true;
        }

        // ---------------- Campaign ----------------
        $campaignId = $rowData['campaign_id'] ?? null;
        if (!empty($campaignId) && !isset($this->campaigns[$campaignId])) {
            $cleanName = trim(explode('(', $rowData['campaign_name'])[0]);

            Campaign::insertOrIgnore([[
                'campaign_id' => $campaignId,
                'campaign_name' => $cleanName,
                'campaign_type' => $rowData['asset_type'] === 'AD_TYPE_SEARCH' ? 'SEARCH' : 'LISTING',
                'campaign_start_date' => $rowData['campaign_start_date'] ?? null,
                'campaign_end_date' => $rowData['campaign_end_date'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ]]);

            // Ensure updated_at is updated if campaign already exists
            Campaign::where('campaign_id', $campaignId)->update(['updated_at' => $now]);

            $this->campaigns[$campaignId] = true;
        }

        // ---------------- Category ----------------
        $categoryId = null;
        if (!empty($rowData['category_id']) && !isset($this->categories[$rowData['category_id']])) {
            Category::insertOrIgnore([[
                'category_id' => $rowData['category_id'],
                'category_name' => $rowData['category_name_l2'] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ]]);
            $this->categories[$rowData['category_id']] = true;
        }
        $categoryId = $rowData['category_id'] ?? null;

        // ---------------- Keyword ----------------
        $keywordId = null;
        if (!empty($rowData['keyword'])) {
            $keyword = Keyword::firstOrCreate(
                ['keyword' => $rowData['keyword']],
                ['created_at' => $now, 'updated_at' => $now]
            );
            $keywordId = $keyword->keyword_id; // ✅ get the actual ID
            $this->keywords[$rowData['keyword']] = true;
        }


        // ---------------- Batch AdPerformance ----------------
        $this->batch[] = [
            'date' => $rowData['date'] ?? null,
            'product_id' => $rowData['product_id'] ?? null,
            'vendor_id' => $rowData['vendor_id'] ?? null,
            'campaign_id' => $campaignId,
            'category_id' => $categoryId,
            'keyword_id' => $keywordId,
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
            'created_at' => $now,
            'updated_at' => $now,
        ];

        if (count($this->batch) >= $this->batchSize) {
            $this->saveBatch();
        }
    }

    public function chunkSize(): int
    {
        return 1000; // process 1000 rows per chunk
    }

    public function __destruct()
    {
        $this->saveBatch(); // save remaining rows
    }

    protected function saveBatch(): void
    {
        if (!empty($this->batch)) {
            DB::table('ad_performances')->insert($this->batch);
            $this->batch = [];
        }
    }
}
