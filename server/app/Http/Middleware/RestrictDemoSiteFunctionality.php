<?php namespace App\Http\Middleware;

use App\Services\Mail\MailTemplates;
use Closure;
use Illuminate\Http\Request;

class RestrictDemoSiteFunctionality
{
    /**
     * @var MailTemplates
     */
    private $mailTemplates;

    /**
     * Routes that are forbidden on demo site.
     *
     * @var array
     */
    private $forbiddenRoutes = [
        ['method' => 'POST', 'name' => 'settings'],
        ['method' => 'POST', 'name' => 'admin/appearance'],
        ['method' => 'DELETE', 'name' => 'tags/delete-multiple'],
        ['method' => 'DELETE', 'name' => 'users/delete-multiple'],
        ['method' => 'DELETE', 'name' => 'groups/*'],
        ['method' => 'DELETE', 'name' => 'replies/*'],
        ['method' => 'DELETE', 'name' => 'tickets/*'],
        ['method' => 'DELETE', 'name' => 'pages'],
        ['method' => 'DELETE', 'name' => 'canned-replies'],
        ['method' => 'DELETE', 'name' => 'triggers'],
        ['method' => 'DELETE', 'name' => 'help-center/articles'],
        ['method' => 'DELETE', 'name' => 'help-center/categories/*'],
        ['method' => 'DELETE', 'name' => 'admin/localizations/*'],
        ['method' => 'PUT', 'name' => 'admin/localizations/*'],
        ['method' => 'PUT', 'name' => 'mail-templates/*'],
        ['method' => 'POST', 'name' => 'tickets/mail/incoming'],
        ['method' => 'POST', 'name' => 'tickets/mail/failed'],
        ['method' => 'POST', 'name' => 'envato/items/import'],
        ['method' => 'POST', 'name' => 'cache/clear'],
        ['method' => 'GET',  'name' => 'reports/envato'],
        ['method' => 'GET',  'name' => 'envato/items/import'],
        ['method' => 'POST', 'name' => 'help-center/actions/import'],
        ['method' => 'POST', 'name' => 'help-center/actions/delete-unused-image'],
        ['method' => 'POST', 'name' => 'users/*/password/change'],
        ['method' => 'POST', 'name' => 'groups/*/add-users'],
        ['method' => 'POST', 'name' => 'groups/*/remove-users'],

        //prevent adding/removing groups and permissions from special users
        ['method' => 'POST', 'name' => 'users/1/*'],
        ['method' => 'POST', 'name' => 'users/2/*'],
        ['method' => 'POST', 'name' => 'users/3/*'],
        ['method' => 'PUT', 'name' => 'users/1*'],
        ['method' => 'PUT', 'name' => 'users/2*'],
        ['method' => 'PUT', 'name' => 'users/3*'],
    ];

    /**
     * RestrictDemoSiteFunctionality constructor.
     *
     * @param MailTemplates $mailTemplates
     */
    public function __construct(MailTemplates $mailTemplates)
    {
        $this->mailTemplates = $mailTemplates;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (config('site.demo') && $this->shouldForbidRequest($request)) {
            return response(['message' => "You can't do that on demo site."], 403);
        }

        return $next($request);
    }

    /**
     * Check if specified request should be forbidden on demo site.
     *
     * @param Request $request
     * @return bool
     */
    private function shouldForbidRequest(Request $request)
    {
        if ($this->shouldForbidTempleRenderRequest($request)) {
            return true;
        }

        foreach ($this->forbiddenRoutes as $route) {
            if ($request->method() === $route['method'] && $request->is('*'.$route['name'].'*')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if current request is for mail template render and if it should be denied.
     *
     * @param Request $request
     * @return bool
     */
    private function shouldForbidTempleRenderRequest(Request $request)
    {
        if ($request->is('*mail-templates/render*')) {
            $defaultContents = $this->mailTemplates->getContents($request->get('file_name'), 'default');
            $defaultContents = $defaultContents[$request->get('type')];

            //only allow mail template preview to be rendered on demo site if its contents
            //have not been changed, to prevent user from executing random php code
            if ($defaultContents !== $request->get('contents')) return true;
        }
    }
}
