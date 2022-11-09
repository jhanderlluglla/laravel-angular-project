<?php namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use App\Services\Auth\UserRepository;

class UserTagsController extends Controller
{
    /**
     * UserRepository instance.
     *
     * @var UserRepository
     */
    private $repository;

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * UserGroupsController constructor.
     *
     * @param UserRepository $repository
     * @param Request $request
     */
    public function __construct(UserRepository $repository, Request $request)
    {
        $this->repository = $repository;
        $this->request = $request;
    }

    /**
     * Sync specified user tags.
     *
     * @param int $userId
     * @return array
     */
    public function sync($userId)
    {
        $this->authorize('update', User::class);

        $this->validate($this->request, [
            'tags'   => 'array',
            'tags.*' => 'string'
        ]);

        return $this->repository->syncTags($userId, $this->request->get('tags', []));
    }
}
