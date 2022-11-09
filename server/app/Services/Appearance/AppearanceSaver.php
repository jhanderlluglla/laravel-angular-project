<?php namespace App\Services\Appearance;

use App\Services\Settings;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Filesystem\FilesystemManager;

class AppearanceSaver
{
    /**
     * @var Filesystem
     */
    private $fs;

    /**
     * Path to custom css theme.
     */
    const THEME_PATH = 'appearance/theme.css';

    /**
     * Path to stored user selected values for css theme.
     */
    const THEME_VALUES_PATH = 'appearance/theme-values.json';

    /**
     * Local filesystem instance.
     *
     * @var Settings
     */
    private $settings;

    /**
     * Flysystem Instance.
     *
     * @var FilesystemManager
     */
    private $storage;

    /**
     * AppearanceManager constructor.
     *
     * @param Filesystem $fs
     * @param Settings $settings
     * @param FilesystemManager $storage
     */
    public function __construct(Filesystem $fs, Settings $settings, FilesystemManager $storage)
    {
        $this->fs = $fs;
        $this->settings = $settings;
        $this->storage = $storage;
    }

    /**
     * Save user modifications to site appearance.
     *
     * @param array $params
     */
    public function save($params)
    {
        foreach ($params as $key => $value) {
            if ($key === 'colors') {
                $this->saveTheme($value);
            } else if (str_contains($value, 'branding-images')) {
                $this->saveImageSetting($key, $value);
            } else {
                $this->saveBasicSetting($key, $value);
            }
        }
    }

    /**
     * Delete old image and store new one for specified setting.
     *
     * @param string $key
     * @param string $value
     */
    private function saveImageSetting($key, $value)
    {
        $old = $this->settings->get($key);

        //delete old file for this image, if it exists
        $this->storage->disk('public')->delete($old);

        //store new image file path in database
        $this->saveBasicSetting($key, $value);
    }

    /**
     * Save basic setting to database or .env file.
     *
     * @param string $key
     * @param mixed $value
     */
    private function saveBasicSetting($key, $value)
    {
        if ($this->settings->get($key) !== $value) {
            $this->settings->save([$key => $value]);
        }
    }

    /**
     * Save generated CSS theme and user defined theme values to disk.
     *
     * @param array $params
     */
    private function saveTheme($params)
    {
        $this->storage->disk('public')->put(self::THEME_VALUES_PATH, json_encode($params['themeValues']));
        $this->storage->disk('public')->put(self::THEME_PATH, $params['theme']);
    }
}