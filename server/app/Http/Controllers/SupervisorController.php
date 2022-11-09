<?php namespace App\Http\Controllers;

use App\Supervisor;
use App\Services\SupervisorRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    private $supervisor;
    private $supervisorRepository;
    public $timestamps = false;

    public function __construct(
        Supervisor $supervisor, 
        SupervisorRepository $supervisorRepository
        )
    {
        $this->supervisor = $supervisor;
        $this->supervisorRepository = $supervisorRepository;
    }

    /**
     * Get all supervisor
     *
     * @return Collection
     */
    public function index(Request $request)
    {
        return $this->supervisorRepository->paginateSupervisor($request->all());
    }

    /**
     * Get save the escalation rule
     *
     * @return Collection
     */
    public function store(Request $request)
    {
        return $this->supervisorRepository->create($request->all());
    }

    /**
     * Get update the escalation rule
     *
     * @return Collection
     */
    public function update(Request $request, $id)
    {
        $supervisor = $this->supervisorRepository->findOrFail($id);
        $this->supervisorRepository->update($supervisor, $request->all());

    }

    public function destroy(Request $request)
    {
        $this->supervisorRepository->delete($request->get('ids'));

    }
}
