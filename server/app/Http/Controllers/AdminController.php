<?php namespace App\Http\Controllers;

use App\Services\SentryApiClient;

class AdminController extends Controller
{
    /**
     * @var SentryApiClient
     */
    private $sentryApiClient;

    /**
     * AdminController constructor.
     *
     * @param SentryApiClient $sentryApiClient
     */
    public function __construct(SentryApiClient $sentryApiClient)
    {
        $this->sentryApiClient = $sentryApiClient;
    }

    public function getErrorLog()
    {
        return $this->sentryApiClient->getErrors();
    }
}