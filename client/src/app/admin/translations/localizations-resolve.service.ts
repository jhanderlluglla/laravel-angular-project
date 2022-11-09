import { Injectable }             from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import {HttpClient} from "../../shared/http-client";
import {Localization} from "../../shared/models/Localization";

@Injectable()
export class LocalizationsResolve implements Resolve<Localization[]> {

    constructor(private http: HttpClient, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Promise<Localization[]> {
        return this.http.get('admin/localizations').toPromise().then(response => {
            return response;
        }, () => {
            this.router.navigate(['/admin']);
            return false;
        });
    }
}