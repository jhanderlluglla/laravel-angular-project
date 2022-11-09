<?php namespace App\Http\Controllers;

use DB;
use App\Category;
use Illuminate\Http\Request;

class CategoriesOrderController extends Controller
{
    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * Help Center category model instance.
     *
     * @var Category
     */
    private $category;

    /**
     * CategoriesOrderController constructor.
     *
     * @param Request $request
     * @param Category $category
     */
    public function __construct(Request $request, Category $category)
    {
        $this->request  = $request;
        $this->category = $category;
    }

    /**
     * Change categories order based on their index in specified IDs array.
     */
    public function change()
    {
        $this->authorize('update', Category::class);

        $this->validate($this->request, [
            'ids'   => 'array|min:1',
            'ids.*' => 'integer'
        ]);

        $queryPart = '';
        foreach($this->request->get('ids') as $position => $id) {
            $position++;
            $queryPart .= " when id=$id then $position";
        }

        $this->category->query()->update(['position' => DB::raw("(case $queryPart end)")]);

        return $this->success([], 200);
    }
}
