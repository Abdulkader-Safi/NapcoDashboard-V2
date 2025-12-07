<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

// CampaignController.php
class CampaignController extends Controller
{
    public function index()
    {
        $records = Campaign::latest()->get();

        return Inertia::render('campaign/index', [
            'campaignData' => $records
        ]);
    }

    // Show the upload page
    public function upload()
    {
        // dd('upload');

        return Inertia::render('campaign/Upload');
    }

    // Handle the actual upload
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        $file = $request->file('file');
        dd($file);
        // Read Excel as array
        $sheets = Excel::toArray([], $file);

        if (empty($sheets) || count($sheets[0]) < 1) {
            return back()->with('error', 'Excel file is empty.');
        }

        $rows = $sheets[0];

        // Determine headers from first row
        $headers = array_map(fn($h) => Str::slug($h, '_'), $rows[0]);

        // Remove header row
        $dataRows = array_slice($rows, 1);

        foreach ($dataRows as $row) {
            $record = [];
            foreach ($headers as $index => $column) {
                $record[$column] = $row[$index] ?? null;
            }

            Campaign::create([
                'data' => $record,
            ]);
        }

        return redirect()->route('campaign.index')->with('success', 'Imported successfully.');
    }
}
