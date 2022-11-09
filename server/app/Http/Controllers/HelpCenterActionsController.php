<?php namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\HelpCenter\HelpCenterActions;

class HelpCenterActionsController extends Controller
{
    /**
     * @var HelpCenterActions
     */
    private $helpCenterActions;

    /**
     * HelpCenterController constructor.
     *
     * @param HelpCenterActions $helpCenterActions
     */
    public function __construct(HelpCenterActions $helpCenterActions)
    {
        $this->helpCenterActions = $helpCenterActions;

        $this->middleware('auth.admin');
    }

    /**
     * Delete help center images that are not attached to any articles.
     */
    public function deleteUnusedImages()
    {
        $this->helpCenterActions->deleteUnusedImages();
    }

    /**
     * Export help center content and images in a .zip file.
     *
     * @return \Symfony\Component\HttpFoundation\Response|\Illuminate\Contracts\Routing\ResponseFactory
     */
    public function export()
    {
        $filename = $this->helpCenterActions->export();

        return response(file_get_contents($filename), 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => 'attachment; filename="hc-export.zip'
        ]);
    }

    /**
     * Import help center content and images from .zip file.
     *
     * @param Request $request
     */
    public function import(Request $request) {
        $path = $request->file('data')->path();
        $this->helpCenterActions->import($path);
    }
}
