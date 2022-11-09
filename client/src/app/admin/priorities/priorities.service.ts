import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Action} from "../../shared/models/Action";
import {Condition} from "../../shared/models/Condition";
import {Priority} from "../../shared/models/Priority";
import {HttpCacheClient} from "../../shared/http-cache-client";

@Injectable()
export class PrioritiesService {

    constructor(private http: HttpCacheClient) {}

    /**
     * Fetch specified priority.
     */
    public getPriority(id: number): Observable<{data: Priority}> {
        return this.http.getWithCache('priorities/'+id);
    }

    /**
     * Fetch all conditions for priorities.
     */
    public getPriorities(params=null) {
        return this.http.getWithCache('priorities', params).map(response =>response.data);
    }

    /**
     * Create a new priority.
     */
    public create(payload: Object): Observable<Priority> {
        return this.http.post('priorities', payload);
    }

    /**
     * Update existing priority.
     */
    public update(payload: Object): Observable<Priority> {
        return this.http.put('priorities/'+payload['id'], payload);
    }

    /**
     * Delete specified priorities.
     */
    public delete(ids: number[]): Observable<number[]> {
        return this.http.delete('priorities', {ids});
    }
}