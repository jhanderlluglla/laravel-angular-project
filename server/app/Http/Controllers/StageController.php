<?php namespace App\Http\Controllers;

use App\Stage;
use App\Services\StageRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class StageController extends Controller
{
    /**
     * Action model instance.
     *
     * @var Action $action
     */
    private $stage;
    private $stageRepository;

    public function __construct(Stage $stage, StageRepository $stageRepository)
    {
        $this->stage = $stage;
        $this->stageRepository = $stageRepository;
    }

    /**
     * Get all stage
     *
     * @return Collection
     */
    public function index(Request $request)
    {
        return $this->stageRepository->paginateStage($request->all());
    }

    /**
     * Get save the escalation rule
     *
     * @return Collection
     */
    public function store(Request $request)
    {
        return $this->stageRepository->create($request->all());
    }

    /**
     * Get update the escalation rule
     *
     * @return Collection
     */
    public function update(Request $request, $id)
    {
        $stage = $this->stageRepository->findOrFail($id);
        $this->stageRepository->update($stage, $request->all());
    }

    
    public function destroy(Request $request)
    {
        $this->stageRepository->delete($request->get('ids'));

    }
}
