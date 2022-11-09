import {Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {CannedRepliesService} from "../canned-replies.service";
import {UploadsService} from "../../../shared/uploads.service";
import {TextEditorComponent} from "../../../text-editor/text-editor.component";
import {CannedReply} from "../../../shared/models/CannedReply";
import {Upload} from "../../../shared/models/Upload";
import {BaseModalClass} from "../../../shared/modal/base-modal";

@Component({
    selector: 'crupdate-canned-reply-modal',
    templateUrl: './crupdate-canned-reply-modal.component.html',
    styleUrls: ['./crupdate-canned-reply-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CrupdateCannedReplyModalComponent extends BaseModalClass {
    @ViewChild('textEditor') textEditor: TextEditorComponent;

    /**
     * Attachments added to this canned reply.
     */
    public attachments = [];

    /**
     * Canned reply model.
     */
    public model: CannedReply = new CannedReply();

    /**
     * NewCannedReplyComponent constructor.
     */
    constructor(
        protected elementRef: ElementRef,
        protected renderer: Renderer2,
        private cannedReplies: CannedRepliesService,
        private uploads: UploadsService
    ) {
        super(elementRef, renderer);
    }

    /**
     * Show modal.
     */
    public show(params: {contents?: {body: string, uploads: Upload[]}, cannedReply?: CannedReply}) {
        //init modal with specified body and uploads
        if (params.contents) {
            this.setContents(params.contents);
        }

        //init modal using existing canned reply
        if (params.cannedReply) {
            this.model = new CannedReply(params.cannedReply);
            this.setContents({body: this.model.body, uploads: this.model.uploads});
        }

        super.show(params);
    }

    /**
     * Hide modal.
     */
    public close() {
        super.close();
        this.textEditor.destroyEditor();
    }

    /**
     * Create new canned reply or update existing one and close modal.
     */
    public confirm() {
        let payload = this.getPayload(), request;

        if (this.model.id) {
            request = this.cannedReplies.update(this.model.id, payload);
        } else {
            request = this.cannedReplies.create(payload);
        }

        request.subscribe(response => {
            super.done(response.data);
        }, super.handleErrors.bind(this));
    }

    /**
     * Get payload for new canned reply backend call.
     */
    private getPayload(): Object {
        return {
            name: this.model.name,
            body: this.textEditor.getContents(),
            uploads: this.attachments.map(attachment => attachment.file_name),
        };
    }

    /**
     * Set specified body and uploads.
     */
    private setContents(contents: {body?: string, uploads?: Upload[]} = {}) {
        if (contents.body) {
            this.textEditor.setContents(contents.body);
        }

        if (contents.uploads) {
            this.attachments = contents.uploads.slice();
        }
    }

    /**
     * Upload given files to server and push them into attachments array.
     */
    public uploadFiles(files: FileList) {
        this.uploads.uploadFiles(files).subscribe(response => {
            this.attachments = this.attachments.concat(response.data);
        });
    }

    /**
     * Remove file attached to current canned reply by id.
     */
    public removeUpload(id) {
        for (let i = 0; i < this.attachments.length; i++) {
            if (this.attachments[i].id == id) {
                this.attachments.splice(i, 1);
            }
        }
    }
}