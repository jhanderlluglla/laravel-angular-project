import {Injectable} from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {UserService} from "../../admin/users/user.service";
import {User} from "../../shared/models/User";
import {CurrentUser} from "../../auth/current-user";
import {Observable} from "rxjs/Observable";
import {ValueListsService} from "../../shared/value-lists.service";

@Injectable()
export class AccountSettingsResolve implements Resolve<{user: User, selects: Object}> {

    constructor(
        private users: UserService,
        private router: Router,
        private currentUser: CurrentUser,
        private values: ValueListsService
    ) {}

    resolve(route: ActivatedRouteSnapshot): Promise<{user: User, selects: Object}> {
        return Observable.forkJoin(
            this.users.getUser(this.currentUser.get('id')),
            this.values.getValuesForSelects(),
        ).toPromise().then(response => {
            return {user: response[0], selects: response[1]};
        }, () => {
            this.router.navigate(['/']);
            return false;
        });
    }
}