import { Injectable }             from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import {HttpClient} from "../../shared/http-client";
import {MailTemplate} from "../../shared/models/MailTemplate";

@Injectable()
export class MailTemplatesResolve implements Resolve<{model: MailTemplate, html: string, plain?: string}> {

    constructor(private http: HttpClient, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Promise<{model: MailTemplate, html: string, plain?: string}> {
        return this.http.get('mail-templates').toPromise().then(response => {
            return response;
        }, () => {
            this.router.navigate(['/admin']);
            return false;
        });
    }
}