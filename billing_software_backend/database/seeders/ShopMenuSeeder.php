<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Budget;
use App\Models\Profession;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShopMenuSeeder extends Seeder
{
    /**
     * Seeds header dropdown data (Brands, Budgets, Professions) for the
     * active RenewLap shop (company_id = 3) and links products to brands/professions.
     */
    public function run(): void
    {
        $company_id = 3;

        // ── Brands ───────────────────────────────────────────────────────────
        $brands = [
            1 => 'Dell',
            2 => 'HP',
            3 => 'Lenovo',
            4 => 'ASUS',
            5 => 'Acer',
            6 => 'Apple',
            7 => 'MSI',
        ];

        foreach ($brands as $id => $name) {
            Brand::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $name,
                    'category_id' => 1,
                    'subcategory_id' => 0,
                    'company_id' => $company_id,
                    'status' => 'active',
                    'is_deleted' => 0,
                ]
            );
        }

        // Point the test products at the real Acer brand and retire the duplicate
        DB::table('products')->whereIn('id', [9, 12])->update(['brand_id' => 5]);
        Brand::where('id', 9)->where('company_id', $company_id)->update(['is_deleted' => 1]);

        // ── Budgets ──────────────────────────────────────────────────────────
        // Clean out old test budgets for this company
        DB::table('budgets')->where('company_id', $company_id)->delete();

        $budgets = [
            ['name' => 'Under ₹30,000',        'min_price' => 0,        'max_price' => 30000],
            ['name' => '₹30,000 – ₹50,000',    'min_price' => 30000,    'max_price' => 50000],
            ['name' => '₹50,000 – ₹70,000',    'min_price' => 50000,    'max_price' => 70000],
            ['name' => '₹70,000 – ₹1,00,000',  'min_price' => 70000,    'max_price' => 100000],
            ['name' => 'Above ₹1,00,000',      'min_price' => 100000,   'max_price' => null],
        ];

        foreach ($budgets as $budget) {
            Budget::create(array_merge($budget, [
                'company_id' => $company_id,
                'status' => 'active',
                'is_deleted' => 0,
            ]));
        }

        // ── Professions ──────────────────────────────────────────────────────
        $professions = [
            1 => 'Student',
            2 => 'Business Professional',
            3 => 'Software Developer',
            4 => 'Creative Professional',
            5 => 'Gamer',
            6 => 'Office & Administration',
            7 => 'Medical Professional',
        ];

        foreach ($professions as $id => $name) {
            Profession::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $name,
                    'company_id' => $company_id,
                    'status' => 'active',
                    'is_deleted' => 0,
                ]
            );
        }

        // ── Link products to professions ─────────────────────────────────────
        $productProfessions = [
            9  => 1, // Acer Aspire 5 A515-56       → Student
            12 => 1, // ff                          → Student
            13 => 6, // Dell Inspiron 15            → Office & Administration
            14 => 2, // HP Pavilion 14              → Business Professional
            15 => 1, // Lenovo IdeaPad Slim 3       → Student
            16 => 1, // ASUS VivoBook 15            → Student
            17 => 1, // Acer Aspire 5               → Student
            18 => 3, // Apple MacBook Air M2        → Software Developer
            19 => 2, // Dell Latitude 5420          → Business Professional
            20 => 2, // HP EliteBook 840 G8         → Business Professional
            21 => 2, // Lenovo ThinkPad E14         → Business Professional
            22 => 5, // ASUS TUF Gaming F15         → Gamer
            23 => 5, // Acer Nitro V                → Gamer
            24 => 3, // MSI Modern 14               → Software Developer
            25 => 1, // Dell Vostro 3520            → Student
            26 => 1, // HP 15s                      → Student
            27 => 5, // Lenovo LOQ Gaming           → Gamer
        ];

        foreach ($productProfessions as $productId => $professionId) {
            DB::table('products')->where('id', $productId)->update(['profession_id' => $professionId]);
        }
    }
}
