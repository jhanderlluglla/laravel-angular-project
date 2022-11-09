import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams, RequestOptionsArgs, Headers, ResponseContentType} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import {ErrorObservable} from "rxjs/observable/ErrorObservable";
import {SettingsService} from "./settings.service";
import {Router} from "@angular/router";
import {Translations} from "./translations/translations.service";
import {CurrentUser} from "../auth/current-user";
import {ToastService} from "./toast/toast.service";

@Injectable()
export class HttpClient {

    /**
     * Base URI for the API.
     */
    private baseUri: string;

    /**
     * Headers that should be applied to all http requests.
     */
    private defaultHeaders = {};

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
        this.baseUri = this.settings.getBaseUrl() + 'secure';
    }

    /**
     * Perform a request with GET http method.
     */
    public get(url: string, params: any = null, headers = null) {
        return this.makeRequest('GET', url, params, headers);
    }

    /**
     * Perform a request with POST http method.
     */
    public post(url: string, params: any = null, headers = null) {
        return this.makeRequest('POST', url, params, headers);
    }

    /**
     * Perform a request with PUT http method.
     */
    public put(url: string, params: any = null, headers = null) {
        return this.makeRequest('PUT', url, params, headers);
    }

    /**
     * Perform a request with DELETE http method.
     */
    public delete(url, params = null, headers = null) {
        return this.makeRequest('DELETE', url, params, headers);
    }

    /**
     * Perform any type of http request with specified parameters.
     */
    public makeRequest(type, url, params, headers = {}, responseType = 'Json'): Observable<any> {
        //prepare request options
        let requestOptions: RequestOptionsArgs = {
            method: type,
            url: this.makeUrl(url),
            body: params,
            responseType: ResponseContentType[responseType]
        };

        //add any specified custom headers to request
        requestOptions.headers = this.makeHeaders(headers);

        //if request is GET prepare query string request option
        if (type.toLowerCase() == 'get' && params) {
            requestOptions['search'] = this.makeSearchParams(params);
        }

        return this.http.request(requestOptions.url, requestOptions)
            .map(this.extractData.bind(this))
            .catch(this.handleError.bind(this));
    }

    /**
     * Set a header that should be applied to all http requests.
     */
    public setDefaultHeader(key: string, value: string) {
        this.defaultHeaders[key] = value;
    }

    /**
     * Create Headers object from specified
     * custom headers and default headers.
     */
    private makeHeaders(customHeaders = {}): Headers {
        let headers = new Headers();

        let merged = Object.assign({}, this.defaultHeaders, customHeaders);

        for (let key in merged) {
            headers.set(key, merged[key]);
        }

        headers.set('Access-Control-Allow-Credentials', 'true');
        return headers;
    }

    /**
     * Create UrlSearchParams object from specified query string params.
     */
    private makeSearchParams(params): URLSearchParams {
        let searchParams = new URLSearchParams();

        for (let key in params) {
            if ( ! params.hasOwnProperty(key)) continue;

            //convert arrays to string
            if (Array.isArray(params[key])) {
                params[key] = params[key].join(',');
            }

            searchParams.set(key, params[key]);
        }

        return searchParams;
    }

    /**
     * Create fully qualified backend or external url for http request.
     */
    public makeUrl(url): string {
        if (url.indexOf('//') > -1) {
            return url;
        } else {
            return this.baseUri +'/'+ url;
        }
    }

    /**
     * Extract http response data.
     */
    private extractData(response: Response) {
        switch (response.headers.get('Content-Type')) {
            case 'application/json':
                return response.json();
            case 'application/zip':
                return response.blob();
            default:
                return response.text();
        }
    }

    /**
     * Handle http request error.
     */
    private handleError (response: Response) {
        let body = this.extractData(response),
            error = {messages: {}, type: 'http', status: response.status};

        if (response.status === 403) {
            this.handle403Error(body);
        }

        //make sure there's always a "messages" object
        if (body && body['messages']) {
            error.messages = body['messages'];
        }

        //translate error messages
        for (let key in error.messages) {
            let transKey = error.messages[key];
            transKey = Array.isArray(transKey) ? transKey[0] : transKey;
            error.messages[key] = this.i18n.t(transKey, {attribute: key});
        }

        return Observable.throw(error);
    }

    /**
     * Redirect user to login page or show toast informing
     * user that he does not have required permissions.
     */
    private handle403Error(response: Object) {
        //if user doesn't have access, navigate to login page
        if (this.currentUser.isLoggedIn()) {
            let msg = "You don't have required permissions to do that.";
            this.toast.show(response['message'] ? response['message'] : msg);
        } else {
            this.router.navigate(['/login']);
        }
    }
}