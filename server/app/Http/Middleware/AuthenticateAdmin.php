<?php

namespace App\Http\Middleware;

use Closure;
use App\User;
use Illuminate\Support\Facades\Auth;

class AuthenticateAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        /** @var User $user */
        $user = Auth::guard($guard)->user();

        if ( ! $user ||  ! $user->hasPermission('superAdmin')) {
            return response()->json([], 403);
        }

        return $next($request);
    }
}
