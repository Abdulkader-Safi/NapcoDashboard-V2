<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();

        // Read Excel as array
        $sheets = Excel::toArray([], $file);

        if (empty($sheets) || count($sheets[0]) < 1) {
            return back()->with('error', 'Excel file is empty.');
        }

        $rows = $sheets[0];

        // Determine headers from first row
        $headers = array_map(fn($h) => \Str::slug(trim($h), '_'), $rows[0]);

        // Remove header row
        $dataRows = array_slice($rows, 1);

        // Combine all rows into a single JSON
        $allData = [];
        foreach ($dataRows as $row) {
            $record = [];
            foreach ($headers as $index => $column) {
                $record[$column] = $row[$index] ?? null;
            }
            $allData[] = $record;
        }

        // Store in a single row
        Campaign::create([
            'file_name' => $fileName,
            'data' => $allData,
        ]);

        return redirect()->route('campaign.index')->with('success', 'Imported successfully.');
    }
}
