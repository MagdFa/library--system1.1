<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Book;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        User::updateOrCreate(
            ['email' => 'admin@library.local'],
            ['name' => 'Admin', 'password' => Hash::make('Password123!'), 'role' => 'admin']
        );

        User::updateOrCreate(
            ['email' => 'librarian@library.local'],
            ['name' => 'Librarian', 'password' => Hash::make('Password123!'), 'role' => 'librarian']
        );

        User::updateOrCreate(
            ['email' => 'user@library.local'],
            ['name' => 'User', 'password' => Hash::make('Password123!'), 'role' => 'user']
        );

        // Categories
        $cats = ['Computer Science','Business','Literature','History','Science','Kids'];
        foreach ($cats as $c) {
            Category::updateOrCreate(['name' => $c], ['name' => $c]);
        }

        // Books
        $creatorId = User::where('email','librarian@library.local')->value('id');

        $books = [
            [
                'isbn' => '978000000001',
                'title' => 'Introduction to Algorithms (Sample)',
                'author' => 'T. Cormen',
                'description' => 'Sample seeded book record (no actual ebook file included).',
                'cover_url' => null,
                'publish_year' => 2020,
                'language' => 'EN',
                'pages' => 1200,
                'price' => 9.99,
                'is_digital' => true,
                'total_copies' => 0,
                'available_copies' => 0,
            ],
            [
                'isbn' => '978000000002',
                'title' => 'Library Management Basics',
                'author' => 'A. Author',
                'description' => 'Physical book example for reservation/loan.',
                'cover_url' => null,
                'publish_year' => 2022,
                'language' => 'EN',
                'pages' => 320,
                'price' => 0,
                'is_digital' => false,
                'total_copies' => 5,
                'available_copies' => 5,
            ],
        ];

        foreach ($books as $b) {
            $book = Book::updateOrCreate(
                ['isbn' => $b['isbn']],
                array_merge($b, ['created_by' => $creatorId])
            );

            // Attach categories
            $category = Category::where('name', $b['is_digital'] ? 'Computer Science' : 'Business')->first();
            if ($category) {
                $book->categories()->syncWithoutDetaching([$category->id]);
            }
        }
    }
}
