<?php namespace App\Services;

use DB;
use App\Supervisor;
use Illuminate\Support\Arr;

class SupervisorRepository {

    /**
     * CannedReply model.
     *
     * @var CannedReply
     */
    private $supervisor;

    /**
     * CannedReplyRepository constructor.
     *
     * @param CannedReply $cannedReply
     * @param Upload $upload
     */
    public function __construct(Supervisor $supervisor)
    {
        $this->supervisor = $supervisor;
    }

    /**
     * Find canned reply by specified id.
     *
     * @param int $id
     * @return CannedReply
     */
    public function findOrFail($id)
    {
        return $this->supervisor->findOrfail($id);
    }

    /**
     * Paginate existing canned replies.
     *
     * @param array $params
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginateSupervisor($params)
    {
        $orderBy    = Arr::get($params, 'order_by', 'created_at');
        $orderDir   = Arr::get($params, 'order_dir', 'desc');
        $perPage    = Arr::get($params, 'per_page', 13);
        $searchTerm = Arr::get($params, 'query');

        $query = $this->supervisor->orderBy($orderBy, $orderDir);

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
        $supervisor = $this->supervisor->create($params);
        return $supervisor;
    }

    /**
     * Update existing canned reply.
     *
     * @param CannedReply $cannedReply
     * @param array $params
     *
     * @return CannedReply
     */
    public function update(Supervisor $supervisor, $params)
    {
        $supervisor->fill($params)->save();

        return $supervisor;
    }

    /**
     * Delete specified canned replies.
     *
     * @param array $ids
     * @return bool
     */
    public function delete($ids)
    {
        return $this->supervisor->whereIn('id', $ids)->delete();
    }
    
}