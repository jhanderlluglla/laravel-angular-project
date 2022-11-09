<?php namespace App\Http\Controllers;

use App\Priority;
use App\Services\PriorityRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class PriorityController extends Controller
{
    /**
     * Action model instance.
     *
     * @var Action $action
     */
    private $priority;
    private $priorityRepository;

    public function __construct(Priority $priority, PriorityRepository $priorityRepository)
    {
        $this->priority = $priority;
        $this->priorityRepository = $priorityRepository;
    }

    /**
     * Get all priority
     *
     * @return Collection
     */
    public function index(Request $request)
    {
        return $this->priorityRepository->paginatePriority($request->all());
    }

    /**
     * Get save the escalation rule
     *
     * @return Collection
     */
    public function store(Request $request)
    {
        return $this->priorityRepository->create($request->all());
    }

    /**
     * Get update the escalation rule
     *
     * @return Collection
     */
    public function update(Request $request, $id)
    {
        $priority = $this->priorityRepository->findOrFail($id);
        $this->priorityRepository->update($priority, $request->all());
    }

    
    public function destroy(Request $request)
    {
        $this->priorityRepository->delete($request->get('ids'));

    }
}
