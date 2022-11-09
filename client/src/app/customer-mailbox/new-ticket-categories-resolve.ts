import {Injectable} from '@angular/core';
import {Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {Tag} from "../shared/models/Tag";
import {HttpCacheClient} from "../shared/http-cache-client";

@Injectable()
export class NewTicketCategoriesResolve implements Resolve<Object> {

    constructor(private http: HttpCacheClient) {}

    resolve(route: ActivatedRouteSnapshot): Promise<Object> {
        return this.http.get('new-ticket/categories').toPromise().then(response => {
            return response;
        }, () => {
            return [];
        });
    }
}