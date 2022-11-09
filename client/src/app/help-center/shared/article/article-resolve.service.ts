import { Injectable }             from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import {HelpCenterService} from "../help-center.service";
import {Article} from "../../../shared/models/Article";

@Injectable()
export class ArticleResolve implements Resolve<Article> {

    constructor(private helpCenter: HelpCenterService, private router: Router) {}

    resolve(route: ActivatedRouteSnapshot): Promise<Article> {
        return this.helpCenter.getArticle(route.params['articleId']).toPromise().then(response => {
            return response.data;
        }, () => {
            this.router.navigate(['/help-center']);
            return false;
        });
    }
}