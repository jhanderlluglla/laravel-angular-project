<?php namespace App\Http\Controllers;

use App\EscalationRule;
use App\Stage;
use App\Supervisor;
use App\Priority;
use App\Tag;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use App\Services\EscalationRuleRepository;

class EscalationRuleController extends Controller
{
    /**
     * Action model instance.
     *
     * @var Action $action
     */
    private $escalationRule;
    private $escalationRuleRepository;
    private $stage;
    private $priority;
    private $supervisor;
    private $tag;

    public function __construct(
        EscalationRule $escalationRule, 
        EscalationRuleRepository $escalationRuleRepository,
        Stage $stage,
        Priority $priority,
        Supervisor $supervisor,
        Tag $tag
        )
    {
        $this->escalationRule = $escalationRule;
        $this->stage = $stage;
        $this->priority = $priority;
        $this->supervisor = $supervisor;
        $this->tag = $tag;
        $this->escalationRuleRepository = $escalationRuleRepository;
    }

    /**
     * Get all escalationRule
     *
     * @return Collection
     */
    public function index(Request $request)
    {
        $result = $this->escalationRuleRepository->paginateEscalationRule($request->all());
        $stages = $this->stage->all();
        $priorities = $this->priority->all();
        $supervisors = $this->supervisor->all();
        $tags = $this->tag->whereIn('name', ['open', 'pending'])->get();
        $result = $result->toArray();
        $result['stages'] = $stages;
        $result['priorities'] = $priorities;
        $result['supervisors'] = $supervisors;
        $result['tags'] = $tags;
        return $result;
    }

    /**
     * Get save the escalation rule
     *
     * @return Collection
     */
    public function store(Request $request)
    {
        return $this->escalationRuleRepository->create($request->all());
    }

    /**
     * Get update the escalation rule
     *
     * @return Collection
     */
    public function update(Request $request, $id)
    {
        $escalationRule = $this->escalationRuleRepository->findOrFail($id);
        $this->escalationRuleRepository->update($escalationRule, $request->all());
    }

    public function destroy(Request $request)
    {
        $escalationRule = $this->escalationRuleRepository->delete($request->get('ids'));
    }
}
