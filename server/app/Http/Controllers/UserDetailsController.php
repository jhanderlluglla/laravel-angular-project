<?php namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use App\Services\Auth\UserRepository;

class UserDetailsController extends Controller
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
     * Update specified user's profile.
     *
     * @param int $userId
     * @return User
     */
    public function update($userId)
    {
        $this->authorize('update', User::class);

        $this->validate($this->request, [
            'details' => 'string|nullable',
            'notes'   => 'string|nullable'
        ]);

        $user = $this->repository->findOrFail($userId, ['details']);

        if ( ! $user->details) {
            $user->setRelation('details', $user->details()->create([]));
        }

        $user->details->fill($this->request->all())->save();

        return $user;
    }
}
