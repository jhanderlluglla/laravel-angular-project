<?php namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use App\Services\TagRepository;

class LoginController extends Controller
{
    use AuthenticatesUsers;

    /**
     * Create a new controller instance.
     */
    public function __construct(TagRepository $tagRepository)
    {
        $this->tagRepository = $tagRepository;
        $this->middleware('guest', ['except' => 'logout']);
    }

    /**
     * The user has been authenticated.
     *
     * @param  Request $request
     * @param  mixed   $user
     * @return mixed
     */
    protected function authenticated(Request $request, $user)
    {
        return $this->success(['data' => $user->load('groups')->toArray(), 'tags' => $this->tagRepository->getStatusAndCategoryTags()]);
    }

    /**
     * Get the failed login response instance.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    protected function sendFailedLoginResponse()
    {
        return $this->error(['general' => trans('auth.failed')]);
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        $this->guard()->logout();

        $request->session()->flush();

        $request->session()->regenerate();

        return $this->success();
    }
}