<?php

use App\Localization;
use Illuminate\Database\Seeder;
use App\Http\Controllers\LocalizationsController;
use Illuminate\Filesystem\Filesystem;

class LocalizationsTableSeeder extends Seeder
{
    /**
     * @var Filesystem
     */
    private $fs;

    /**
     * @var Localization
     */
    private $localization;

    /**
     * LocalizationsTableSeeder constructor.
     *
     * @param Filesystem $fs
     * @param Localization $localization
     */
    public function __construct(Filesystem $fs, Localization $localization)
    {
        $this->fs = $fs;
        $this->localization = $localization;
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $paths = LocalizationsController::DEFAULT_TRANS_PATHS;

        $combined = [];

        //create source => localization json object from default localization files
        foreach ($paths as $path) {
            $combined = array_merge($combined, json_decode($this->fs->get(resource_path($path)), true));
        }

        $this->localization->create([
            'name'  => 'English',
            'lines' => json_encode($combined)
        ]);
    }
}
