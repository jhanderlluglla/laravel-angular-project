import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Action} from "../../shared/models/Action";
import {Condition} from "../../shared/models/Condition";
import {EscalationRule} from "../../shared/models/EscalationRule";
import {HttpCacheClient} from "../../shared/http-cache-client";

@Injectable()
export class EscalationRulesService {

    constructor(private http: HttpCacheClient) {}

    /**
     * Fetch specified stage.
     */
    public getEscalationRule(id: number): Observable<{data: EscalationRule}> {
        return this.http.getWithCache('escalation-rules/'+id);
    }

    /**
     * Fetch all conditions for escalation-rules.
     */
    public getEscalationRules(): Observable<EscalationRule[]> {
        return this.http.getWithCache('escalation-rules');
    }

    /**
     * Create a new stage.
     */
    public create(payload: Object): Observable<EscalationRule> {
        return this.http.post('escalation-rules', payload);
    }

    /**
     * Update existing stage.
     */
    public update(payload: Object): Observable<EscalationRule> {
        return this.http.put('escalation-rules/'+payload['id'], payload);
    }

    /**
     * Delete specified escalation-rules.
     */
    public delete(ids: number[]): Observable<number[]> {
        return this.http.delete('escalation-rules', {ids});
    }
}