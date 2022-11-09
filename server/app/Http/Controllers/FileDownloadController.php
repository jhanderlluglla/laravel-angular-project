<?php namespace App\Http\Controllers;

use Storage;
use Response;
use App\Services\Files\UploadsRepository;

class FileDownloadController extends Controller {

    /**
     * UploadsRepository service instance.
     *
     * @var UploadsRepository
     */
    private $uploads;

    /**
     * FileDownloadController constructor.
     *
     * @param UploadsRepository $uploads
     */
    public function __construct(UploadsRepository $uploads)
    {
        $this->uploads = $uploads;
    }

    /**
     * Download specified file.
     *
     * @param $id
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function download($id)
    {
        $upload = $this->uploads->findOrFail($id);

        $this->authorize('show', $upload);

        return Response::stream(function() use($upload) {
            fpassthru(Storage::readStream($upload->path));
        }, 200, [
            "Content-Type" => $upload->mime,
            "Content-Length" => $upload->size,
            "Content-disposition" => "attachment; filename=\"" . basename($upload->name) . "\"",
        ]);
    }
}
