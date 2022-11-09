import { Injectable }             from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import {HelpCenterService} from "../../shared/help-center.service";
import {Observable} from "rxjs";
import {SettingsService} from "../../../shared/settings.service";
import {Category} from "../../../shared/models/Category";
import {Article} from "../../../shared/models/Article";
import {CategoriesService} from "../../shared/categories.service";

@Injectable()
export class CategoryResolve implements Resolve<{category: Category, articles: Article[]}> {

    constructor(
        private helpCenter: HelpCenterService,
        private categories: CategoriesService,
        private router: Router,
        private settings: SettingsService
    ) {}

    resolve(route: ActivatedRouteSnapshot): Promise<{category: Category, articles: Article[]}> {

        let params = {
            categories: route.params['categoryId'],
            orderBy: this.settings.get('articles.default_order'),
            limit: 10,
        };

        return Observable.forkJoin(
            this.categories.getCategory(route.params['categoryId']),
            this.helpCenter.getArticles(params),
        ).toPromise().then(response => {
            return {category: response[0].data, articles: response[1].data};
        }, () => {
            this.router.navigate(['/help-center']);
            return false;
        });
    }
}