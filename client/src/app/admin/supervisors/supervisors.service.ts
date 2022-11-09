import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Action} from "../../shared/models/Action";
import {Condition} from "../../shared/models/Condition";
import {Supervisor} from "../../shared/models/Supervisor";
import {HttpCacheClient} from "../../shared/http-cache-client";

@Injectable()
export class SupervisorsService {

    constructor(private http: HttpCacheClient) {}

    /**
     * Fetch specified supervisor.
     */
    public getSupervisor(id: number): Observable<{data: Supervisor}> {
        return this.http.getWithCache('supervisors/'+id);
    }

    /**
     * Fetch all conditions for supervisors.
     */
    public getSupervisors(): Observable<Supervisor[]> {
        return this.http.getWithCache('supervisors');
    }

    /**
     * Create a new supervisor.
     */
    public create(payload: Object): Observable<Supervisor> {
        return this.http.post('supervisors', payload);
    }

    /**
     * Update existing supervisor.
     */
    public update(payload: Object): Observable<Supervisor> {
        return this.http.put('supervisors/'+payload['id'], payload);
    }

    /**
     * Delete specified supervisors.
     */
    public delete(ids: number[]): Observable<number[]> {
        return this.http.delete('supervisors', {ids});
    }
}