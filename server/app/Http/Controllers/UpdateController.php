<?php namespace App\Http\Controllers;

use Artisan;
use Exception;
use App\Services\DotEnvEditor;

class UpdateController extends Controller
{
    /**
     * @var DotEnvEditor
     */
    private $dotEnvEditor;

    /**
     * UpdateController constructor.
     *
     * @param DotEnvEditor $dotEnvEditor
     */
    public function __construct(DotEnvEditor $dotEnvEditor)
    {
        $this->middleware('auth.admin');
        $this->dotEnvEditor = $dotEnvEditor;
    }

    /**
     * Update the application.
     */
    public function update()
    {
        Artisan::call('migrate', ['--force' => true]);

        $version = $this->getAppVersion();

        $this->dotEnvEditor->write(['app_version' => $version]);

        return redirect('/');
    }

    /**
     * Get new app version.
     *
     * @return string
     */
    private function getAppVersion()
    {
        try {
            return $this->dotEnvEditor->load(base_path('.env.example'))['app_version'];
        } catch (Exception $e) {
            return '1.0.2';
        }
    }
}
