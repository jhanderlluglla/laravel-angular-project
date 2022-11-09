<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call(TagTableSeeder::class);
        $this->call(TriggersTableSeeder::class);
        $this->call(GroupsTableSeeder::class);
        $this->call(SettingsTableSeeder::class);
        $this->call(MailTemplatesSeeder::class);
        $this->call(LocalizationsTableSeeder::class);

        if (config('app.env') === 'testing') {
            $this->call(E2ETestSeeder::class);
        }
    }
}
