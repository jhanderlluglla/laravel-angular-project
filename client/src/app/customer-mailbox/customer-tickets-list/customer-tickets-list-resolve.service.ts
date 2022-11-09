import {Injectable, Injector}             from '@angular/core';
import {Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {CurrentUser} from "../../auth/current-user";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";

@Injectable()
export class CustomerTicketsListResolve implements Resolve<Object> {

    constructor(private currentUser: CurrentUser, private injector: Injector) {}

    resolve(route: ActivatedRouteSnapshot): any {
        let id  = this.currentUser.get('id');

        let paginator = new UrlAwarePaginator(this.injector);

        return paginator.paginate('users/'+id+'/tickets').subscribe(() => {
            return paginator;
        });
    }
}