import {Injectable} from '@angular/core';
import {Router, Resolve, ActivatedRouteSnapshot} from '@angular/router';
import {Observable} from "rxjs";
import {HelpCenterService} from "../../shared/help-center.service";
import {Category} from "../../../shared/models/Category";
import {Article} from "../../../shared/models/Article";
import {CategoriesService} from "../../shared/categories.service";

@Injectable()
export class NewArticleResolve implements Resolve<{categories: Category[], article?: Article}> {

    constructor(
        private helpCenter: HelpCenterService,
        private categories: CategoriesService,
        private router: Router
    ) {}

    resolve(route: ActivatedRouteSnapshot): any {
        let articleId = route.params['article_id'];

        if (articleId) {
            return Observable.forkJoin(
                this.categories.getCategories(),
                this.helpCenter.getArticle(route.params['article_id'])
            ).toPromise().then(response => {
                return {categories: response[0], article: response[1].data};
            }, () => {
                this.router.navigate(['/help-center/manage/articles']);
                return false;
            });
        } else {
            return this.categories.getCategories().toPromise().then(response => {
                return {categories: response};
            }, () => {
                this.router.navigate(['/help-center/manage/articles']);
                return false;
            });
        }
    }
}