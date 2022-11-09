<?php namespace App\Http\Controllers;

use Cache;
use App\Category;
use Carbon\Carbon;
use App\Services\Settings;

class HelpCenterController extends Controller
{
    /**
     * Category model instance.
     *
     * @var Category $category
     */
    private $category;

    /**
     * Settings Service Instance.
     *
     * @var Settings
     */
    private $settings;

    /**
     * HelpCenterController constructor.
     *
     * @param Category $category
     * @param Settings $settings
     */
    public function __construct(Category $category, Settings $settings)
    {
        $this->category = $category;
        $this->settings = $settings;
    }

    /**
     * Return all help center categories, child categories and articles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('index', Category::class);

        $data = Cache::remember('hc.home', Carbon::now()->addDays(2), function() {

            //load categories with children and articles
            $categories = $this->category
                ->rootOnly()
                ->withCount('children')
                ->with(['children' => function($query) { $query->withCount('articles')->with(['articles' => function($query) {
                    $query->orderByPosition()->select('id', 'title', 'position', 'slug');
                }])->orderByPosition(); }])
                ->orderByPosition()->limit(10)->get();

            //limit children and categories
            return $categories->each(function($category) {

                $numOfChildren = $this->settings->get('hc_home.children_per_category', 6);
                $category->setRelation('children', $category->children->take($numOfChildren));

                $category->children->each(function($child) {
                    $numOfArticles = $this->settings->get('hc_home.articles_per_category', 5);
                    $child->setRelation('articles', $child->articles->take($numOfArticles));
                });
            });
        });

        return $this->success(['data' => $data]);
    }
}
