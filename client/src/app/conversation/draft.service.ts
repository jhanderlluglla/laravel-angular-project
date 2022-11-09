import {Injectable} from "@angular/core";
import {TicketAttachmentsService} from "../ticketing/ticket-attachments.service";
import {Reply} from "../shared/models/Reply";
import {UploadsService} from "../shared/uploads.service";
import {TicketsService} from "../ticketing/tickets.service";
import {Observable} from "rxjs/Observable";

@Injectable()
export class Draft {

    /**
     * Model of currently active draft.
     */
    private model: Reply;

    /**
     * ID of currently active ticket.
     */
    private ticketId: number;

    /**
     * Draft service constructor.
     */
    constructor(
        private ticketUploads: TicketAttachmentsService,
        private tickets: TicketsService,
        private uploads: UploadsService
    ) {
        this.reset();
    }

    /**
     * Get currently active draft.
     */
    public get() {
        return this.model;
    }

    /**
     * Set specified draft as active.
     */
    public set(draft: Reply) {
        this.model = draft;
    }

    /**
     * Set draft body to specified contents.
     */
    public setBody(contents: string) {
        this.model.body = contents;
    }

    /**
     * Set currently active ticket id.
     */
    public setTicketId(id: number) {
        this.ticketId = id;
    }

    /**
     * Check if current draft is empty.
     */
    public isEmpty(): boolean {
        return this.model.body.length === 0 && this.model.uploads.length === 0;
    }

    /**
     * Upload specified files and attach them to current draft.
     */
    public uploadFiles(fl: FileList) {
        if (this.uploads.filesAreInvalid(fl, true)) return;

        this.uploads.uploadFiles(fl).subscribe(response => {
            this.model.uploads = this.model.uploads.concat(response.data);
            this.save();
        });
    }

    /**
     * Detach specified upload from current draft.
     */
    public detachUpload(uploadId: number) {
        this.ticketUploads.detach(this.model.id, uploadId).subscribe();
    }

    /**
     * Save current draft to backend.
     */
    public save(params: {body?: string} = {}): Observable<{data: Reply}> {
        if (this.isEmpty()) return;

        let request = this.tickets.saveDraft(
            this.ticketId,
            this.getPayload(params),
            this.model.id,
        ).catch(() => {
           return Observable.of({data: this.get()});
        }).share();

        request.subscribe(response => {
            this.set(response['data']);
        });

        return request;
    }

    /**
     * Delete currently active draft.
     */
    public delete() {
        if (this.model.id) {
            this.tickets.deleteDraft(this.model.id).subscribe();
        }

        this.reset();
    }

    /**
     * Get payload for backend for current draft.
     */
    public getPayload(params = {}) {
        return Object.assign({}, {
            body: this.model.body,
            uploads: this.model.uploads.map(upload => upload.file_name),
        }, params);
    }

    /**
     * Reset draft to initial state.
     */
    public reset() {
        this.set(new Reply({uploads: [], body: ''}));
    }
}