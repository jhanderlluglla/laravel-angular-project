<?php namespace App\Http\Controllers;

use App\Services\TagRepository;
use App\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Tag model.
     *
     * @var Tag
     */
    private $tag;

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * TagRepository instance.
     *
     * @var TagRepository
     */
    private $tagRepository;

    /**
     * TagController constructor.
     *
     * @param Request $request
     * @param Tag $tag
     * @param TagRepository $tagRepository
     */
    public function __construct(Request $request, Tag $tag, TagRepository $tagRepository)
    {
        $this->tag     = $tag;
        $this->request = $request;
        $this->tagRepository = $tagRepository;
    }

    /**
     * Paginate all existing tags.
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function index()
    {
        $this->authorize('index', Tag::class);

        return $this->tagRepository->paginateTags($this->request->all());
    }

    /**
     * Fetch tags needed to display agent mailbox.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function tagsForAgentMailbox()
    {
        return $this->tagRepository->getStatusAndCategoryTags();
    }

    /**
     * Create a new tag.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store()
    {
        $this->authorize('store', Tag::class);

        $this->validate($this->request, $this->tagRepository->getValidationRules('store'));

        $tag = $this->tagRepository->create($this->request->all());

        return $this->success(['data' => $tag], 201);
    }

    /**
     * Update existing tag.
     *
     * @param integer $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update($id)
    {
        $tag = $this->tagRepository->findOrFail($id);

        $this->authorize($tag);

        $this->validate($this->request, $this->tagRepository->getValidationRules('update', $tag->id));

        $tag = $this->tagRepository->update($tag, $this->request->all());

        return $this->success(['data' => $tag]);
    }

    /**
     * Delete multiple tags.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMultiple()
    {
        $this->authorize('destroy', Tag::class);

        $this->validate($this->request, [
            'ids' => 'required|array|min:1'
        ]);

        $this->tagRepository->deleteMultiple($this->request->get('ids'));

        return $this->success([], 204);
    }
}
