<?php namespace App\Http\Controllers;

use App\Trigger;
use Illuminate\Http\Request;
use App\Http\Requests\ModifyTriggers;
use App\Services\Triggers\TriggerRepository;

class TriggersController extends Controller
{
    /**
     * TriggerRepository instance.
     *
     * @var TriggerRepository $trigger
     */
    private $repository;

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    public function __construct(TriggerRepository $repository, Request $request)
    {
        $this->repository = $repository;
        $this->request = $request;
    }

    /**
     * Paginate all available triggers triggers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $this->authorize('index', Trigger::class);

        return $this->success($this->repository->paginate($this->request->all()));
    }

    /**
     * Return specified trigger.
     *
     * @param integer $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $this->authorize('index', Trigger::class);

        return $this->success(['data' => $this->repository->findOrFail($id)]);
    }

    /**
     * Create a new trigger.
     *
     * @param ModifyTriggers $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ModifyTriggers $request)
    {
        $this->authorize('store', Trigger::class);

        return response($this->repository->create($this->request->all()), 201);
    }

    /**
     * Update existing trigger.
     *
     * @param integer $id
     * @param ModifyTriggers $request
     *
     * @return Trigger
     */
    public function update($id, ModifyTriggers $request)
    {
        $this->authorize('update', Trigger::class);

        return $this->repository->update($id, $this->request->all());
    }

    /**
     * Delete triggers matching specified ids.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy()
    {
        $this->authorize('destroy', Trigger::class);

        $this->validate($this->request, [
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|integer'
        ]);

        return response($this->repository->delete($this->request->get('ids')), 204);
    }
}
