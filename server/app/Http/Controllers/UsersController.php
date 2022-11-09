<?php namespace App\Http\Controllers;

use App\User;
use App\Group;
use Illuminate\Http\Request;
use App\Http\Requests\ModifyUsers;
use App\Services\Auth\UserRepository;

class UsersController extends Controller {

    /**
     * User group model instance.
     *
     * @var Group
     */
    private $group;

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * UserRepository service instance.
     *
     * @var UserRepository
     */
    private $userRepository;

    /**
     * UsersController constructor.
     *
     * @param Group $group
     * @param Request $request
     * @param UserRepository $userRepository
     */
    public function __construct(Group $group, Request $request, UserRepository $userRepository)
    {
        $this->group   = $group;
        $this->request = $request;
        $this->userRepository = $userRepository;
    }

    /**
     * Paginate all existing users.
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function index()
    {
        $this->authorize('index', User::class);

        return $this->userRepository->paginateUsers($this->request->all());
    }

    /**
     * Get specified user.
     *
     * @param int $id
     * @return User
     */
    public function show($id)
    {
        $user = $this->userRepository->findOrFail($id);

        $this->authorize('show', $user);

        $relations = ['groups', 'tags', 'secondary_emails', 'social_profiles', 'purchase_codes'];

        //only agents should be able to see user details
        if ($this->request->user() && $this->request->user()->isAgent()) {
            $relations[] = 'details';
        }

        return $user->load($relations);
    }

    /**
     * Create a new user.
     *
     * @param ModifyUsers $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ModifyUsers $request)
    {
        $this->authorize('store', User::class);

        $user = $this->userRepository->create($this->request->all());

        return $this->success(['data' => $user], 201);
    }

    /**
     * Update an existing user.
     *
     * @param integer $id
     * @param ModifyUsers $request
     *
     * @return User
     */
    public function update($id, ModifyUsers $request)
    {
        $user = $this->userRepository->findOrFail($id);

        $this->authorize($user);

        $user = $this->userRepository->update($user, $this->request->all());

        return $user;
    }

    /**
     * Delete multiple users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMultiple()
    {
        $this->authorize('destroy', User::class);

        $this->validate($this->request, [
            'ids' => 'required|array|min:1'
        ]);

        $this->userRepository->deleteMultiple($this->request->get('ids'));

        return $this->success([], 204);
    }
}
