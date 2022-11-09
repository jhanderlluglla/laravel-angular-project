<?php

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Filesystem\Filesystem;

class SettingsTableSeeder extends Seeder
{
    /**
     * @var Filesystem
     */
    private $filesystem;

    /**
     * SettingsTableSeeder constructor.
     *
     * @param Filesystem $filesystem
     */
    public function __construct(Filesystem $filesystem)
    {
        $this->filesystem = $filesystem;
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $settings = $this->filesystem->getRequire(resource_path('value-lists/default-settings.php'));

        $settings = array_map(function($setting) {
            //add timestamps
            $setting['created_at'] = Carbon::now();
            $setting['updated_at'] = Carbon::now();

            //make sure all settings have "private" field to
            //avoid db errors due to different column count
            if ( ! array_key_exists('private', $setting)) {
                $setting['private'] = 0;
            }

            return $setting;
        }, $settings);

        DB::table('settings')->insert($settings);
    }
}
