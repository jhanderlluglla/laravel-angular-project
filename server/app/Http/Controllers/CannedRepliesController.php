<?php namespace App\Http\Controllers;

use Auth;
use App\CannedReply;
use Illuminate\Http\Request;
use App\Services\CannedReplyRepository;

class CannedRepliesController extends Controller {

    /**
     * CannedReplyRepository instance.
     *
     * @var CannedReplyRepository
     */
    private $repository;

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * CannedRepliesController constructor.
     *
     * @param Request $request
     * @param CannedReplyRepository $repository
     */
    public function __construct(Request $request, CannedReplyRepository $repository)
    {
        $this->request = $request;
        $this->repository = $repository;
    }

    /**
     * Paginate existing canned replies.
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function index()
    {
        $this->authorize('index', CannedReply::class);

        return $this->repository->paginateCannedReplies($this->request->all());
    }

    /**
     * Create a new canned reply.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function store()
    {
        $this->authorize('store', CannedReply::class);

        $userId = Auth::user()->id;

        $this->validate($this->request, [
            'body' => 'required|string|min:3',
            'name' => 'required|string|min:3|max:255|unique:canned_replies,name,NULL,id,user_id,'.$userId,
            'uploads' => 'array|max:5'
        ]);

        $cannedReply = $this->repository->create($userId, $this->request->all());

        return $this->success(['data' => $cannedReply], 201);
    }

    /**
     * Update existing canned reply.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update($id)
    {
        $cannedReply = $this->repository->findOrFail($id);

        $this->authorize('update', $cannedReply);

        $userId = Auth::user()->id;

        $this->validate($this->request, [
            'body' => 'required|string|min:3',
            'name' => "required|string|min:3|max:255|unique:canned_replies,name,$id,id,user_id,$userId",
            'uploads'   => 'array|max:5',
            'uploads.*' => 'string|min:10'
        ]);

        $cannedReply = $this->repository->update($cannedReply, $this->request->all());

        return $this->success(['data' => $cannedReply], 201);
    }

    /**
     * Delete specified canned replies.
     *
     * @return bool
     */
    public function destroy()
    {
        $this->authorize('destroy', CannedReply::class);

        return $this->repository->delete($this->request->get('ids'));
    }

}
