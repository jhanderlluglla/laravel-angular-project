<?php namespace App\Http\Middleware;

use App;
use Closure;
use Illuminate\View\View;
use Illuminate\Http\Request;
use App\Services\PrerenderUtils;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ArticlesController;
use App\Http\Controllers\HelpCenterController;
use App\Http\Controllers\CategoriesController;

class PrerenderIfCrawler
{
    /**
     * @var PrerenderUtils
     */
    private $utils;

    /**
     * List of crawler user agents.
     *
     * @var array
     */
    private $crawlerUserAgents = [
        // googlebot, yahoo, and bingbot are covered by_escaped_fragment_ check.
        // 'googlebot',
        // 'yahoo',
        // 'bingbot',
        'baiduspider',
        'facebookexternalhit',
        'twitterbot',
        'rogerbot',
        'linkedinbot',
        'embedly',
        'quora link preview',
        'showyoubot',
        'outbrain',
        'pinterest',
        'developers.google.com/+/web/snippet',
        'slackbot',
    ];

    /**
     * PrerenderIfCrawler constructor.
     *
     * @param PrerenderUtils $utils
     */
    public function __construct(PrerenderUtils $utils)
    {
        $this->utils = $utils;
    }

    /**
     * Prerender request if it's requested by a crawler.
     *
     * @param Request $request
     * @param Closure $next
     * @param string $type
     * @return Request|View
     */
    public function handle(Request $request, Closure $next, $type)
    {
        if ($this->shouldPrerender($request)) {
            switch ($type) {
                case 'category':
                    $category = App::make(CategoriesController::class)->show($request->route('categoryId'))->getData(true)['data'];
                    $payload = ['category' => $category, 'utils' => $this->utils];
                    return response(view('prerender.category')->with($payload));
                case 'article':
                    $article = App::make(ArticlesController::class)->show($request->route('articleId'))->getData(true)['data'];
                    $payload = ['article' => $article, 'utils' => $this->utils];
                    return response(view('prerender.article')->with($payload));
                case 'search':
                    $query = $request->route('query');
                    $articles = App::make(SearchController::class)->articles($query)['data'];
                    $payload = ['utils' => $this->utils, 'query' => $query, 'articles' => $articles];
                    return response(view('prerender.search')->with($payload));
                case 'home':
                    $categories = App::make(HelpCenterController::class)->index()->getData(true)['data'];
                    $payload = ['utils' => $this->utils, 'categories' => $categories];
                    return response(view('prerender.home')->with($payload));
            }
        }

        return $next($request);
    }

    /**
     * Check if request should be prerendered.
     *
     * @param Request $request
     * @return bool
     */
    private function shouldPrerender(Request $request)
    {
        $userAgent = strtolower($request->server->get('HTTP_USER_AGENT'));
        $bufferAgent = $request->server->get('X-BUFFERBOT');

        $shouldPrerender = false;

        if ( ! $userAgent) return false;
        if ( ! $request->isMethod('GET')) return false;

        // prerender if _escaped_fragment_ is in the query string
        if ($request->query->has('_escaped_fragment_')) $shouldPrerender = true;

        // prerender if a crawler is detected
        foreach ($this->crawlerUserAgents as $crawlerUserAgent) {
            if (str_contains($userAgent, strtolower($crawlerUserAgent))) {
                $shouldPrerender = true;
            }
        }

        if ($bufferAgent) $shouldPrerender = true;

        return $shouldPrerender;
    }
}