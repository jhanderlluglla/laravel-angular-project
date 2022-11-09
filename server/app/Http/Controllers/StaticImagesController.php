<?php namespace App\Http\Controllers;

use App\Upload;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use App\Services\Files\FileStorage;

class StaticImagesController extends Controller {

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * @var FileStorage
     */
    private $fileStorage;

    /**
     * UploadsController constructor.
     *
     * @param Request $request
     * @param FileStorage $fileStorage
     */
    public function __construct(Request $request, FileStorage $fileStorage) {
        $this->request = $request;
        $this->fileStorage = $fileStorage;
    }

    /**
     * Store files in database and filesystem.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload() {

        $this->authorize('store', Upload::class);

        $this->validate($this->request, [
            'type'    => 'required|string|in:article,ticket,branding,pages',
            'files'   => 'required|array|min:1|max:5',
            'files.*' => 'required|file|image'
        ]);

        $type = $this->request->get('type', 'article');

        $urls = array_map(function($file) use($type) {
            return ['url' => $this->fileStorage->putStatic($file, $type)];
        }, $this->request->all()['files']);

        return $this->success(['data' => $urls], 201);
    }
}
