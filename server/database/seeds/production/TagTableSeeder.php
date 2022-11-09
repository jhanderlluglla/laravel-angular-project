<?php

use Illuminate\Database\Seeder;

class TagTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $statuses = [
            ['name' => 'open', 'type' => 'status', 'created_at' => \Carbon\Carbon::now(), 'updated_at' => \Carbon\Carbon::now()],
            ['name' => 'closed', 'type' => 'status', 'created_at' => \Carbon\Carbon::now(), 'updated_at' => \Carbon\Carbon::now()],
            ['name' => 'pending', 'type' => 'status', 'created_at' => \Carbon\Carbon::now(), 'updated_at' => \Carbon\Carbon::now()],
            ['name' => 'spam', 'type' => 'status', 'created_at' => \Carbon\Carbon::now(), 'updated_at' => \Carbon\Carbon::now()]
        ];

        DB::table('tags')->insert($statuses);
    }
}
