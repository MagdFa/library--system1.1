<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('isbn')->nullable()->index();
            $table->string('title')->index();
            $table->string('author')->index();
            $table->text('description')->nullable();
            $table->string('cover_url')->nullable();
            $table->unsignedInteger('publish_year')->nullable();
            $table->string('language')->nullable();
            $table->unsignedInteger('pages')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_digital')->default(false);
            $table->string('file_path')->nullable();
            $table->unsignedInteger('available_copies')->default(0);
            $table->unsignedInteger('total_copies')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
