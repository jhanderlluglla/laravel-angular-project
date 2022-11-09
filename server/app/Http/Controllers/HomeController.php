<?php namespace App\Http\Controllers;

use Illuminate\View\View;
use App\Services\Settings;
use App\Services\BootstrapData;

class HomeController extends Controller
{
    /**
     * Show application homepage.
     *
     * @param BootstrapData $bootstrapData
     * @param Settings $settings
     *
     * @return View
     */
    public function index(BootstrapData $bootstrapData, Settings $settings)
    {
        $htmlBaseUri = '/';

        //get uri for html "base" tag
        if (substr_count(url(''), '/') > 2) {
            $htmlBaseUri = parse_url(url(''))['path'] . '/';
        }

        return view('main')->with('bootstrapData', $bootstrapData->get())->with('htmlBaseUri', $htmlBaseUri)->with('settings', $settings);
    }
}
