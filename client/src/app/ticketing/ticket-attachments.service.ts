import {Injectable} from '@angular/core';
import {HttpClient} from "../shared/http-client";
import {Observable} from "rxjs";
import {Upload} from "../shared/models/Upload";

@Injectable()
export class TicketAttachmentsService {

    /**
     * TicketAttachmentsService Constructor.
     */
    constructor(private httpClient: HttpClient) {}

    /**
     * Attach specified uploads to current reply draft.
     */
    public attach(conversationId: number, attachments: Upload[] = [], draft: string = null) {
        let payload: any = { ids: [] };

        payload.ids = attachments.map(attachment => attachment.id);

        if (draft) payload.body = draft;

        return this.httpClient.post('tickets/'+conversationId+'/attachments', payload);
    }

    /**
     * Detach specified upload from draft.
     */
    public detach(draftId: number, uploadId: number): Observable<{data: number}> {
        return this.httpClient.post('drafts/'+draftId+'/uploads/'+uploadId+'/detach');
    }
}