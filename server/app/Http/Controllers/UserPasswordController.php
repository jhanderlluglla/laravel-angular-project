<?php namespace App\Http\Controllers;

use Hash;
use App\User;
use Illuminate\Http\Request;
use App\Services\Auth\UserRepository;

class UserPasswordController extends Controller
{
    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * UserRepository instance.
     *
     * @var UserRepository
     */
    private $users;

    /**
     * ChangePasswordController constructor.
     *
     * @param Request $request
     * @param UserRepository $users
     */
    public function __construct(Request $request, UserRepository $users)
    {
        $this->users = $users;
        $this->request = $request;
    }

    /**
     * Change specified user password.
     *
     * @param int $userId
     * @return User
     */
    public function change($userId)
    {
        $user = $this->users->findOrFail($userId);

        $this->authorize('update', $user);

        $this->validate($this->request, $this->rules($user));

        $password = Hash::make($this->request->get('new_password'));
        $user->forceFill(['password' => $password])->save();

        return $user;
    }

    /**
     * Get validation rules for changing user password.
     *
     * @param User $user
     * @return array
     */
    private function rules(User $user)
    {
        $rules = [
            'new_password' => 'required|confirmed'
        ];

        if ($user->hasPassword) {
            $rules['current_password'] = "required|hash:{$user->password}";
            $rules['new_password'] .= '|different:current_password';
        }

        return $rules;
    }
}