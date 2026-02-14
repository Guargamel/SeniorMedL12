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
        Schema::create('medicine_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Senior citizen who made the request
            $table->foreignId('medicine_id')->constrained()->onDelete('cascade'); // Requested medicine
            $table->integer('quantity'); // Quantity requested
            $table->text('reason')->nullable(); // Reason for request
            $table->enum('status', ['pending', 'approved', 'declined'])->default('pending'); // Request status
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null'); // Staff/admin who reviewed
            $table->timestamp('reviewed_at')->nullable(); // When it was reviewed
            $table->text('review_notes')->nullable(); // Notes from reviewer
            $table->timestamps();

            // Indexes for better query performance
            $table->index('status');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_requests');
    }
};
