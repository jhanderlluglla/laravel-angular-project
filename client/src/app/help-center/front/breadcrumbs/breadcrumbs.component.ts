import {Component, ViewEncapsulation, ChangeDetectionStrategy, OnChanges, Input} from "@angular/core";
import {HcUrls} from "../../shared/hc-urls.service";
import {Article} from "../../../shared/models/Article";
import {Category} from "../../../shared/models/Category";
import {ActivatedRoute, ActivatedRouteSnapshot} from "@angular/router";

@Component({
    selector: 'breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadCrumbsComponent implements OnChanges {

    /**
     * Resource for which breadcrumbs should be generated.
     */
    @Input() resource: Article|Category|string;

    /**
     * Resource type (article or category)
     */
    @Input() resourceType: string;

    /**
     * Breadcrumb items.
     */
    public items: Object[];

    /**
     * BreadcrumbsComponent Constructor.
     */
    constructor(private urls: HcUrls, private route: ActivatedRoute) {}

    /**
     * Executed on @Input changes.
     */
    ngOnChanges() {
        let sub = this.route.params.subscribe(params => {
            this.update(params);
            sub && sub.unsubscribe();
        });
    }

    /**
     * Update breadcrumbs.
     */
    private update(params: Object) {
        this.reset();

        if ( ! this.resource) return;

        if (this.resourceType === 'article') {
            this.generateArticleBreadCrumb(params);
        } else if (this.resourceType === 'category') {
            this.generateCategoryBreadCrumb();
        } else if (this.resourceType === 'static') {
            this.items.push({name: this.resource});
        }
    }

    /**
     * Generate breadcrumbs for specified help center article.
     */
    private generateArticleBreadCrumb(params: Object) {
        let article = this.resource as Article;

        //article has no categories
        if ( ! article.categories || ! article.categories.length) return;

        //category ids are not present in url, use first article category
        if ( ! params['parentId'] && ! params['childId']) {
            if (article.categories[0].parent) this.addCategoryItem(article.categories[0].parent);
            this.addCategoryItem(article.categories[0]);
        }

        //use category ids from url
        if (params['parentId']) {
            this.addCategoryItem(article.categories.find(category => params['parentId'] == category.id));
        }

        if (params['childId']) {
            this.addCategoryItem(article.categories.find(category => params['childId'] == category.id));
        }

        this.items.push({name: 'Article', link: this.urls.getArticleLink(article)});
    }

    /**
     * Generate breadcrumbs for specified help center category.
     */
    private generateCategoryBreadCrumb() {
        let category = this.resource as Category;

        if (category.parent) this.addCategoryItem(category.parent);

        this.addCategoryItem(category);
    }

    /**
     * Add breadcrumbs item for specified category.
     */
    private addCategoryItem(category: Category) {
        if ( ! category) return;
        this.items.push({name: category.name, link: this.urls.getCategoryLink(category)});
    }

    /**
     * Reset breadcrumb items to initial state.
     */
    private reset() {
        this.items = [{name: 'Help Center', link: '/help-center'}];
    }
}
