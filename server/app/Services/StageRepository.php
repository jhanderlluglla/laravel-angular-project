<?php namespace App\Services;

use DB;
use App\Stage;
use Illuminate\Support\Arr;

class StageRepository {

    /**
     * CannedReply model.
     *
     * @var CannedReply
     */
    private $stage;

    /**
     * CannedReplyRepository constructor.
     *
     * @param CannedReply $cannedReply
     * @param Upload $upload
     */
    public function __construct(Stage $stage)
    {
        $this->stage = $stage;
    }

    /**
     * Find canned reply by specified id.
     *
     * @param int $id
     * @return CannedReply
     */
    public function findOrFail($id)
    {
        return $this->stage->findOrfail($id);
    }

    /**
     * Paginate existing canned replies.
     *
     * @param array $params
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginateStage($params)
    {
        $orderBy    = Arr::get($params, 'order_by', 'created_at');
        $orderDir   = Arr::get($params, 'order_dir', 'desc');
        $perPage    = Arr::get($params, 'per_page', 13);
        $searchTerm = Arr::get($params, 'query');

        $query = $this->stage->orderBy($orderBy, $orderDir);

        if ($searchTerm) {
            $query->where('name', 'like', $searchTerm.'%');
        }

        return $query->orderBy($orderBy, $orderDir)->paginate($perPage);
    }

    /**
     * Create a new canned reply.
     *
     * @param int   $userId
     * @param array $params
     *
     * @return CannedReply
     */
    public function create($params)
    {
        $stage = $this->stage->create($params);
        return $stage;
    }

    /**
     * Update existing canned reply.
     *
     * @param CannedReply $cannedReply
     * @param array $params
     *
     * @return CannedReply
     */
    public function update(Stage $stage, $params)
    {
        $stage->fill($params)->save();

        return $stage;
    }

    /**
     * Delete specified canned replies.
     *
     * @param array $ids
     * @return bool
     */
    public function delete($ids)
    {
        return $this->stage->whereIn('id', $ids)->delete();
    }
    
}