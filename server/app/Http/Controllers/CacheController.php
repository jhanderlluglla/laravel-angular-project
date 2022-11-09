<?php namespace App\Http\Controllers;

use Cache;

class CacheController extends Controller
{
    /**
     * CacheController constructor.
     */
    public function __construct()
    {
        $this->middleware('auth.admin');
    }

    /**
     * Clear all site cache.
     */
    public function clear()
    {
        Cache::flush();
    }
}
