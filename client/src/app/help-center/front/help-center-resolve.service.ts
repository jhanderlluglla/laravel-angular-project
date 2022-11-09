import {Injectable} from '@angular/core';
import {Resolve, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {HelpCenterService} from "../shared/help-center.service";
import {Category} from "../../shared/models/Category";

@Injectable()
export class HelpCenterResolve implements Resolve<Category> {

    constructor(private helpCenter: HelpCenterService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Category> {
        return this.helpCenter.getDataForHelpCenterFrontPage().toPromise().then(response => {
            return response.data;
        }, () => {
            return false;
        });
    }
}