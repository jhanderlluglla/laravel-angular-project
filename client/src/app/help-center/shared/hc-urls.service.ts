import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {utils} from "../../shared/utils";
import {Article} from "../../shared/models/Article";
import {Category} from "../../shared/models/Category";

@Injectable()
export class HcUrls {

    /**
     * Create new HcUrls service instance.
     */
    constructor(public route: ActivatedRoute) {}

    /**
     * Create router link array for specified article.
     */
    public getArticleLink(article: Article, category?: Category): any[] {
        let base = ['/help-center/articles'] as any[];

        if (category) {
            if (category.parent_id) base.push(category.parent_id);
            base.push(category.id);
        }

        return base.concat([article.id, HcUrls.getSlug(article)]);
    }

    /**
     * Create router link array for specified category.
     */
    public getCategoryLink(category: Category): any[] {
        return ['/help-center/categories', category.id, HcUrls.getSlug(category)];
    }

    /**
     * Create router link array for current customer tickets list.
     */
    public getCustomerTicketsListLink() {
        return ['/help-center/tickets'];
    }

    public getSearchPageLink(query: string) {
        return ['/help-center/search', query];
    }

    static getSlug(resource: {id: number, title?: string, name?: string, slug?: string}) {
        if (resource.slug) {
            return resource.slug
        } else {
            return utils.slugifyString(resource.title || resource.name);
        }
    }
}