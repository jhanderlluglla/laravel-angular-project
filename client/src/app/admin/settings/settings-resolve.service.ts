import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import {HttpClient} from "../../shared/http-client";

@Injectable()
export class SettingsResolve implements Resolve<{client: Object, server: Object}> {

    constructor(private http: HttpClient, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Promise<{client: Object, server: Object}> {
        return this.http.get('settings').toPromise().then(response => {
            return response;
        }, () => {
            this.router.navigate(['/admin']);
            return false;
        });
    }
}