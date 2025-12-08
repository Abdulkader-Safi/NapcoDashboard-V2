<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ad_performances', function (Blueprint $table) {
            $table->id(); // PK

            // Date
            $table->date('date')->nullable();

            // Foreign Keys (nullable as per ERD)
            $table->string('product_id')->nullable();
            $table->string('vendor_id')->nullable();
            $table->unsignedBigInteger('campaign_id')->nullable();
            $table->unsignedBigInteger('keyword_id')->nullable();  // NULL for LISTING
            $table->unsignedBigInteger('category_id')->nullable(); // NULL for SEARCH

            // Metrics
            $table->integer('impressions')->nullable();
            $table->integer('clicks')->nullable();
            $table->integer('orders')->nullable();
            $table->integer('unit_sold')->nullable();

            $table->decimal('ctr', 8, 4)->nullable();
            $table->decimal('cvr', 8, 4)->nullable();

            $table->integer('avg_ad_position')->nullable();

            $table->decimal('sales_revenue', 12, 2)->nullable();
            $table->decimal('total_ad_spend', 12, 2)->nullable();

            $table->decimal('cpa', 12, 4)->nullable();
            $table->decimal('cpc', 12, 4)->nullable();
            $table->decimal('roas', 12, 4)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_performances');
    }
};
