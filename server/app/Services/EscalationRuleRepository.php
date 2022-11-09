<?php namespace App\Services;

use DB;
use App\EscalationRule;
use App\SupervisorRule;
use Illuminate\Support\Arr;
use Carbon\Carbon;

class EscalationRuleRepository {

    /**
     * CannedReply model.
     *
     * @var CannedReply
     */
    private $escalationRule;

    /**
     * CannedReplyRepository constructor.
     *
     * @param CannedReply $cannedReply
     * @param Upload $upload
     */
    public function __construct(
        EscalationRule $escalationRule,
        SupervisorRule $supervisorRule
        )
    {
        $this->escalationRule = $escalationRule;
        $this->supervisorRule = $supervisorRule;
    }

    /**
     * Find canned reply by specified id.
     *
     * @param int $id
     * @return CannedReply
     */
    public function findOrFail($id)
    {
        return $this->escalationRule->findOrfail($id);
    }

    /**
     * Paginate existing canned replies.
     *
     * @param array $params
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginateEscalationRule($params)
    {
        $orderBy    = Arr::get($params, 'order_by', 'created_at');
        $orderDir   = Arr::get($params, 'order_dir', 'desc');
        $perPage    = Arr::get($params, 'per_page', 13);
        $searchTerm = Arr::get($params, 'query');


        $query = $this->escalationRule
                    ->with([
                        'stage',
                        'priority',
                        'tag',
                        'supervisors'
                        ]);
       
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
        $escalationRule = $this->escalationRule->create($params);
        if (isset($params['supervisor_ids'])) {
            foreach ($params['supervisor_ids'] as $key => $sv) {
                $this->supervisorRule->create([
                    'supervisor_id' => $sv,
                    'rule_id' => $escalationRule['id']
                    ]);
            }
        }
        return $escalationRule;
    }

    /**
     * Update existing canned reply.
     *
     * @param CannedReply $cannedReply
     * @param array $params
     *
     * @return CannedReply
     */
    public function update(EscalationRule $escalationRule, $params)
    {
        $escalationRule->fill($params)->save();

        return $escalationRule;
    }

    /**
     * Delete specified canned replies.
     *
     * @param array $ids
     * @return bool
     */
    public function delete($ids)
    {
        $this->supervisorRule->whereIn('rule_id', $ids);
        return $this->escalationRule->whereIn('id', $ids)->delete();
    }
}