import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Action} from "../../shared/models/Action";
import {Condition} from "../../shared/models/Condition";
import {Stage} from "../../shared/models/Stage";
import {HttpCacheClient} from "../../shared/http-cache-client";

@Injectable()
export class StagesService {

    constructor(private http: HttpCacheClient) {}

    /**
     * Fetch specified stage.
     */
    public getStage(id: number): Observable<{data: Stage}> {
        return this.http.getWithCache('stages/'+id);
    }

    /**
     * Fetch all conditions for stages.
     */
    public getStages(): Observable<Stage[]> {
        return this.http.getWithCache('stages');
    }

    /**
     * Create a new stage.
     */
    public create(payload: Object): Observable<Stage> {
        return this.http.post('stages', payload);
    }

    /**
     * Update existing stage.
     */
    public update(payload: Object): Observable<Stage> {
        return this.http.put('stages/'+payload['id'], payload);
    }

    /**
     * Delete specified stages.
     */
    public delete(ids: number[]): Observable<number[]> {
        return this.http.delete('stages', {ids});
    }
}