<?php namespace App\Http\Controllers;

use App\Http\Requests\ModifyCategories;
use DB;
use Auth;
use App\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class CategoriesController extends Controller {

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
	 * Logged in user instance or null.
	 *
	 * @var \App\User|null
	 */
	private $user;

    /**
     * CategoriesController constructor.
     *
     * @param Request $request
     * @param Category $category
     */
	public function __construct(Request $request, Category $category)
	{
		$this->request  = $request;
		$this->category = $category;
		$this->user     = Auth::user();
	}

    /**
     * Show specified category.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
	public function show($id)
    {
        $this->authorize('show', Category::class);

        $category = $this->category->with('children', 'parent.children')->findOrFail($id);

        return $this->success(['data' => $category]);
    }

	/**
	 * Return all help center categories current user has access to.
	 * 
	 * @return Collection
	 */
	public function index()
	{
	    $this->authorize('index', Category::class);

		$categories = $this->category->rootOnly()
            ->withCount('articles')
            ->with(['children' => function($query) {
                $query->with('parent')->withCount('articles')->orderByPosition();
            }])
            ->orderByPosition()
            ->get();

		return $categories;
	}

    /**
     * Create new help center category.
     *
     * @param ModifyCategories $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
	public function store(ModifyCategories $request)
	{
		$this->authorize('store', Category::class);

		$last = $this->category->orderBy('position', 'desc')->first();

		$category = $this->category->create([
			'name'        => $this->request->get('name'),
			'description' => $this->request->get('description'),
			'parent_id'   => $this->request->get('parent_id', null),
			'position'    => $last ? $last->position + 1 : 1,
		]);

		return response($category, 201);
	}

    /**
     * Update specified help center category.
     *
     * @param integer $id
     * @param ModifyCategories $request
     *
     * @return Category
     */
	public function update($id, ModifyCategories $request)
	{
		$this->authorize('update', Category::class);

		$category = $this->category->findOrFail($id);

		$category->fill($this->request->all())->save();

		return $category;
	}

	/**
	 * Delete specified help center category and detach all folders attached to it.
	 *
	 * @param integer $id
	 * @return JsonResponse
	 */
	public function destroy($id)
	{
        $this->authorize('destroy', Category::class);

	    $category = $this->category->findOrFail($id);

		$category->where('parent_id', $category->id)->update(['parent_id' => null]);
		$category->delete();

		return $this->success(['data' => $category->id], 204);
	}
}
