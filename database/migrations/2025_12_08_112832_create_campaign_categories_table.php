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
        Schema::create('campaign_categories', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->unsignedBigInteger('campaign_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->timestamps();

            // Optional: Unique constraint to avoid duplicates
            $table->unique(['campaign_id', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_categories');
    }
};
