<?php namespace App\Services;

use DB;
use App\Priority;
use Illuminate\Support\Arr;

class PriorityRepository {

    /**
     * CannedReply model.
     *
     * @var CannedReply
     */
    private $priority;

    /**
     * CannedReplyRepository constructor.
     *
     * @param CannedReply $cannedReply
     * @param Upload $upload
     */
    public function __construct(Priority $priority)
    {
        $this->priority = $priority;
    }

    /**
     * Find canned reply by specified id.
     *
     * @param int $id
     * @return CannedReply
     */
    public function findOrFail($id)
    {
        return $this->priority->findOrfail($id);
    }

    /**
     * Paginate existing canned replies.
     *
     * @param array $params
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginatePriority($params)
    {
        $orderBy    = Arr::get($params, 'order_by', 'created_at');
        $orderDir   = Arr::get($params, 'order_dir', 'desc');
        $perPage    = Arr::get($params, 'per_page', 13);
        $searchTerm = Arr::get($params, 'query');

        $query = $this->priority->orderBy($orderBy, $orderDir);

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
        $priority = $this->priority->create($params);
        return $priority;
    }

    /**
     * Update existing canned reply.
     *
     * @param CannedReply $cannedReply
     * @param array $params
     *
     * @return CannedReply
     */
    public function update(Priority $priority, $params)
    {
        $priority->fill($params)->save();

        return $priority;
    }

    /**
     * Delete specified canned replies.
     *
     * @param array $ids
     * @return bool
     */
    public function delete($ids)
    {
        return $this->priority->whereIn('id', $ids)->delete();
    }
    
}