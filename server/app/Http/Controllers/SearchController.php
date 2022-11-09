<?php namespace App\Http\Controllers;

use DB;
use App;
use Auth;
use Config;
use App\User;
use App\Ticket;
use App\Article;
use App\Services\Settings;
use Illuminate\Http\Request;
use App\Jobs\StoreSearchTerm;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class SearchController extends Controller
{
    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * User model.
     *
     * @var User
     */
    private $user;

    /**
     * Ticket model.
     *
     * @var Ticket
     */
    private $ticket;

    /**
     * Article model.
     *
     * @var Article
     */
    private $article;

    /**
     * Settings service instance.
     *
     * @var Settings
     */
    private $settings;

    /**
     * How much results should be returned per page.
     *
     * @var int
     */
    private $perPage;

    /**
     * SearchController constructor.
     *
     * @param Request $request
     * @param Settings $settings
     * @param Ticket $ticket
     * @param User $user
     * @param Article $article
     */
    public function __construct(Request $request, Settings $settings, Ticket $ticket, User $user, Article $article)
    {
        $this->user = $user;
        $this->ticket = $ticket;
        $this->article = $article;
        $this->request = $request;
        $this->settings = $settings;
        $this->perPage = $this->request->get('per_page', 5);
    }

    /**
     * Search for tickets, customers and articles using specified query.
     *
     * @param string $query
     * @return \Illuminate\Http\JsonResponse
     */
    public function all($query)
    {
        return $this->success(['data' => [
            'tickets'  => $this->tickets($query),
            'users'    => $this->users($query),
            'articles' => $this->articles($query),
        ]]);
    }

    /**
     * Search for help center articles matching specified query.
     *
     * @param string $term
     * @return LengthAwarePaginator
     */
    public function articles($term)
    {
        $this->authorize('index', Article::class);

        $bodyLimit = $this->request->get('body_limit', 200);

        $ids = $this->article->search($term)->keys();

        $query = $this->article->whereIn('id', $ids)->with('categories.parent');

        $query = $this->filterArticlesByCategory($query);

        //order mysql query by search provider order
        if ($ids->isNotEmpty() && Config::get('database.default') === 'mysql') {
            $ids = $ids->implode(',');
            $query->orderByRaw(DB::raw("field(id,$ids)"), $ids)->get();
        }

        $paginator = $query->paginate($this->perPage);

        $items = $paginator->map(function(Article $article) use($bodyLimit) {
            return [
                'id' => $article->id,
                'title' => $article->title,
                'slug' => $article->slug,
                'body' => str_limit(strip_tags(str_replace('&nbsp;', '', $article->body)), $bodyLimit),
                'description' => $article->description,
                'categories' => $article->categories,
            ];
        });

        dispatch(new StoreSearchTerm($term, Auth::user()));

        return $paginator->setCollection($items)->toArray();
    }

    /**
     * Search for users matching specified query.
     *
     * @param string $query
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator;
     */
    public function users($query)
    {
        $this->authorize('index', User::class);
        return $this->user->search($query)->paginate($this->perPage)->toArray();
    }

    /**
     * Search for tickets matching specified query.
     *
     * @param string $query
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function tickets($query)
    {
        $this->authorize('index', Ticket::class);

        $detailed = $this->request->get('detailed', false);

        $ids = [];
        if (strpos($query, 'AP') == 0) {
            $ids = $this->ticket->where('id', 'Like', '%'.substr($query, 2).'%')->pluck('id')->toArray();
        }
        else {
            $ids = array_merge(
                $this->ticket->where('id', 'Like', '%'.$query.'%')->pluck('id')->toArray(),
                $this->ticket->search($query)->keys()->toArray()
            );
        }

        $query = $this->ticket->compact()->whereIn('id', $ids);

        //load detailed information about ticket, if requested
        if ($detailed) {
            $query->with(['user', 'tags'])->withCount('replies');
        }

        return $query->paginate($this->perPage)->toArray();
    }

    /**
     * Filter articles query by categories.
     *
     * @param Builder $query
     * @return Builder
     */
    private function filterArticlesByCategory(Builder $query)
    {
        //filter by specified category
        if ($this->request->get('category')) {
            return $query->whereHas('categories', function(Builder $q) {
                $q->where('name', $this->request->get('category'));
            });
        }

        //filter by user envato purchases
        if ($this->settings->get('envato.filter_search') && Auth::check() && ! Auth::user()->isSuperAdmin()) {
            return $query->whereHas('categories', function(Builder $q) {
                $names = Auth::user()->purchase_codes->pluck('item_name');
                $q->whereIn('name', $names->toArray());
            });
        }

        return $query;
    }
}
