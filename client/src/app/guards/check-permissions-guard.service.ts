import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, Router} from '@angular/router';
import {CurrentUser} from "../auth/current-user";

@Injectable()
export class CheckPermissionsGuard implements CanActivateChild {

    constructor(private currentUser: CurrentUser, private router: Router) {}

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let hasPermission = true;

        if (route.data['permissions']) {
            hasPermission = this.currentUser.hasPermissions(route.data['permissions']);
        }

        //user can access this route, bail
        if (hasPermission) {
            return true;
        }

        //redirect to login page, if user is not logged in
        if ( ! this.currentUser.isLoggedIn()) {
            this.currentUser.redirectUri = state.url;
            this.router.navigate(['login']);
        }

        //if this is the first url user has tried to access
        //in this session, redirect to help center, because
        //angular will not trigger route redirects automatically
        //also, make sure user can actually access
        //help center in order to prevent infinite loops
        else if (this.router.url === '/' && this.currentUser.hasPermission('categories.view')) {
            this.router.navigate(['/help-center']);
        }

        return hasPermission;
    }
}