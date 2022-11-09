import {Injectable} from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {HelpCenterService} from "../../shared/help-center.service";
import {SettingsService} from "../../../shared/settings.service";
import {Article} from "../../../shared/models/Article";

@Injectable()
export class HcSearchPageResolve implements Resolve<{data: Article[]}> {

    constructor(
        private helpCenter: HelpCenterService,
        private router: Router,
        private settings: SettingsService,
    ) {}

    resolve(route: ActivatedRouteSnapshot): Promise<{data: Article[]}> {
        let query     = route.params['query'],
            limit     = this.settings.get('hc.search_page.limit', 20),
            bodyLimit = this.settings.get('hc.search_page.body_limit', 300);

        return this.helpCenter.findArticles(query, {limit: limit, body_limit: bodyLimit}).toPromise().then(response => {
            return response.data;
        }, () => {
            this.router.navigate(['/help-center']);
            return false;
        });
    }
}