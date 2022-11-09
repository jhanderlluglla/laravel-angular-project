import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {HttpCacheClient} from "./http-cache-client";

@Injectable()
export class ValueListsService {

    /**
     * ValueListsService Constructor.
     */
    constructor(private httpClient: HttpCacheClient) {}

    /**
     * Fetch all existing app permissions.
     */
    public getPermissions(): Observable<Object> {
        return this.httpClient.getWithCache('value-lists/permissions');
    }

    public getValuesForSelects() {
        return this.httpClient.getWithCache('value-lists/selects');
    }
}