<?php namespace App\Http\Controllers\Auth;

use App\User;
use App\Services\Settings;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\Auth\UserRepository;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\RegistersUsers;

class RegisterController extends Controller
{
    use RegistersUsers;

    /**
     * Settings service instance.
     *
     * @var Settings
     */
    private $settings;

    /**
     * UserRepository service instance.
     *
     * @var UserRepository
     */
    private $repository;

    /**
     * RegisterController constructor.
     *
     * @param Settings $settings
     * @param UserRepository $repository
     */
    public function __construct(Settings $settings, UserRepository $repository)
    {
        $this->settings = $settings;
        $this->repository = $repository;

        $this->middleware('guest');

        //abort if registration should be disabled
        if ($this->settings->get('disable.registration')) abort(404);
    }

    /**
     * Handle a registration request for the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $rules = [
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|min:6|max:255|confirmed',
        ];

        //add purchase code validation
        if ($this->settings->envatoPurchaseCodeIsRequired()) {
            $rules['purchase_code'] = 'required|min:1|max:255|unique:purchase_codes,code|purchase_code_valid';
        }

        $this->validate($request, $rules);

        event(new Registered($user = $this->create($request->all())));

        $this->guard()->login($user);

        return $this->registered($request, $user);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return User
     */
    protected function create(array $data)
    {
        return $this->repository->create($data);
    }

    /**
     * The user has been registered.
     *
     * @param Request $request
     * @param $user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function registered(Request $request, User $user)
    {
        return $this->success(['data' => $user->load('groups')->toArray()]);
    }
}