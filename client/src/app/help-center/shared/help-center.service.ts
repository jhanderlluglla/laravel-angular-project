import {Injectable} from '@angular/core';
import {CustomScrollbarDirective} from "../../shared/custom-scrollbar/custom-scrollbar.directive";
import {HttpClient} from "../../shared/http-client";
import {Observable} from "rxjs";
import {Category} from "../../shared/models/Category";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Article} from "../../shared/models/Article";

@Injectable()
export class HelpCenterService {

    /**
     * HelpCenter Service Constructor.
     */
    constructor(public httpClient: HttpClient) {}

    /**
     * Search help center articles.
     */
    public findArticles(query, params: Object = {}) {
        return this.httpClient.get('search/articles/'+encodeURIComponent(query), params);
    }

    /**
     * Create new help center article.
     */
    public createArticle(payload) {
        return this.httpClient.post('help-center/articles', payload);
    }

    /**
     * Update existing help center article.
     */
    public updateArticle(payload) {
        return this.httpClient.put('help-center/articles/'+payload.id, payload);
    }

    /**
     * Submit user feedback about specified article.
     */
    public submitArticleFeedback(id: number, payload: Object) {
        return this.httpClient.post('help-center/articles/'+id+'/feedback', payload);
    }

    /**
     * Fetch help center articles.
     */
    public getArticles(params = null): Observable<{data: Article[]}> {
        return this.httpClient.get('help-center/articles', params);
    }

    /**
     * Get a single help center article matching given id.
     */
    public getArticle(id: number, params?) {
        return this.httpClient.get('help-center/articles/'+id, params);
    }

    /**
     * Get categories, child categories and articles for help center front page.
     */
    public getDataForHelpCenterFrontPage() {
        return this.httpClient.get('help-center');
    }

    /**
     * Delete articles with given ids.
     */
    public deleteArticles(articleIds: number[]) {
        return this.httpClient.delete('help-center/articles', {ids: articleIds});
    }
}