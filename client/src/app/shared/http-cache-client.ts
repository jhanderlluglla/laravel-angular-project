import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {HttpClient} from "./http-client";
import {Http} from "@angular/http";
import {SettingsService} from "./settings.service";
import {Translations} from "./translations/translations.service";
import {CurrentUser} from "../auth/current-user";
import {Router} from "@angular/router";
import {ToastService} from "./toast/toast.service";

@Injectable()
export class HttpCacheClient extends HttpClient {

    /**
     * Http cache store.
     */
    protected cache = {};

    /**
     * HttpClient Constructor.
     */
    constructor(
        protected http: Http,
        protected settings: SettingsService,
        protected i18n: Translations,
        protected currentUser: CurrentUser,
        protected router: Router,
        protected toast: ToastService
    ) {
        super(http, settings, i18n, currentUser, router, toast);
    }

    /**
     * Make new GET request or returned its cached response.
     */
    public getWithCache(url: string, params: Object = {}): Observable<any> {
        let key = this.makeCacheKey(url, params);

        //this request is in progress and not yet resolved,
        //we can return same observable for all callers
        if (this.cache[key] instanceof Observable) {
            return this.cache[key];

        //this request is completed and cached, we can return cached response
        } else if (this.cache[key]) {
            return Observable.of(this.cache[key]);

        //this request was not made yet, so we make a new one
        } else {
            let request = this.get(url, params).share();
            request.subscribe(data => this.cache[key] = data);
            return this.cache[key] = request;
        }
    }

    /**
     * Clear cache on POST requests.
     */
    public post(url: string, params?, headers?) {
        this.clearCache();
        return super.post(url, params);
    }

    /**
     * Clear cache on PUT requests.
     */
    public put(url: string, params?, headers?) {
        this.clearCache();
        return super.put(url, params);
    }

    /**
     * Clear cache on DELETE requests.
     */
    public delete(url: string, params?, headers?) {
        this.clearCache();
        return super.delete(url, params);
    }

    /**
     * Clear http cache for this service.
     */
    public clearCache() {
        this.cache = {};
    }

    /**
     * Create unique cache key for specified http request.
     */
    private makeCacheKey(url: string, params?): string {
        return url + JSON.stringify(params);
    }
}