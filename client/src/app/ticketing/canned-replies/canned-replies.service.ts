import {Injectable} from '@angular/core';
import {HttpClient} from "../../shared/http-client";
import {Observable} from "rxjs/Observable";
import {CannedReply} from "../../shared/models/CannedReply";

@Injectable()
export class CannedRepliesService {

    /**
     * CannedRepliesService Constructor.
     */
    constructor(private httpClient: HttpClient) {}

    /**
     * Get canned replies matching specified query.
     */
    public getReplies(params: Object) {
        params['per_page'] = 10;
        return this.httpClient.get('canned-replies', params);
    }

    /**
     * Create a new canned reply.
     */
    public create(params): Observable<CannedReply> {
        return this.httpClient.post('canned-replies', params);
    }

    /**
     * Update existing canned reply.
     */
    public update(id: number, params): Observable<CannedReply> {
        return this.httpClient.put('canned-replies/'+id, params);
    }

    /**
     * Delete specified canned replies.
     */
    public delete(ids: number[]): Observable<any> {
        return this.httpClient.delete('canned-replies', {ids});
    }
}