import {Injectable} from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {TicketsService} from "../tickets.service";
import {UserService} from "../../admin/users/user.service";
import {Observable} from "rxjs/Observable";
import {User} from "../../shared/models/User";

@Injectable()
export class UserProfileResolve implements Resolve<{user: User, articles: Object}> {

    constructor(private tickets: TicketsService, private users: UserService, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Promise<any> {
        return Observable.forkJoin(
            this.users.getUser(route.params['id']),
            this.tickets.getTickets({user_id: route.params['id']})
        ).toPromise().then(response => {
            return {user: response[0], tickets: response[1]};
        }, () => {
            this.router.navigate(['/mailbox']);
            return false;
        });
    }
}