<?php namespace App\Http\Controllers;

use App\User;
use App\Email;
use Illuminate\Http\Request;
use App\Services\Auth\UserRepository;

class UserEmailsController extends Controller
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
     * Email model instance.
     *
     * @var Email
     */
    private $email;

    /**
     * UserGroupsController constructor.
     *
     * @param UserRepository $repository
     * @param Request $request
     * @param Email $email
     */
    public function __construct(UserRepository $repository, Request $request, Email $email)
    {
        $this->email = $email;
        $this->request = $request;
        $this->repository = $repository;
    }

    /**
     * Attach specified emails to user.
     *
     * @param int $userId
     * @return User
     */
    public function attach($userId)
    {
        $this->authorize('update', User::class);

        $user = $this->repository->findOrFail($userId);

        $this->validate($this->request, [
            'emails'   => 'required|array|min:1',
            'emails.*' => 'required|string|email|unique:emails,address|unique:users,email',
        ]);

        collect($this->request->get('emails'))->each(function($email) use($user) {
            $user->secondary_emails()->create(['address' => $email]);
        });

        return $user;
    }

    /**
     * Detach specified emails from user.
     *
     * @param int $userId
     * @return User
     */
    public function detach($userId)
    {
        $this->authorize('update', User::class);

        $this->validate($this->request, [
            'emails'   => 'required|array|min:1',
            'emails.*' => 'required|string|email|exists:emails,address',
        ]);

        $user = $this->repository->findOrFail($userId, 'secondary_emails');

        $user->secondary_emails->each(function($email) {
            if (collect($this->request->get('emails'))->contains($email->address)) {
                $email->delete();
            }
        });

        return $user;
    }
}
