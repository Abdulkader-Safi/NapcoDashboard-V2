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
        Schema::create('campaign_keywords', function (Blueprint $table) {
            $table->id(); // Primary key

            $table->unsignedBigInteger('campaign_id')->nullable();
            $table->unsignedBigInteger('keyword_id')->nullable();

            $table->timestamps();

            // Prevent duplicate pairs
            $table->unique(['campaign_id', 'keyword_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_keywords');
    }
};
