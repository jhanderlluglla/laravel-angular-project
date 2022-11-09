import {Component, ElementRef, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {UploadsService} from "../../shared/uploads.service";
import {TicketsService} from "../tickets.service";
import {Reply} from "../../shared/models/Reply";
import {BaseModalClass} from "../../shared/modal/base-modal";
import {Upload} from "../../shared/models/Upload";

@Component({
    selector: 'update-reply-modal',
    templateUrl: './update-reply-modal.component.html',
    styleUrls: ['./update-reply-modal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UpdateReplyModalComponent extends BaseModalClass {
    @ViewChild(TextEditorComponent) textEditor: TextEditorComponent;

    /**
     * Model of reply that is being edited.
     */
    private reply: Reply;

    /**
     * List of attachments for reply we are currently updating.
     */
    public attachments: Upload[] = [];

    /**
     * UpdateReplyModalComponent Constructor.
     */
    constructor(
        protected elementRef: ElementRef,
        protected renderer: Renderer2,
        private tickets: TicketsService,
        private uploads: UploadsService
    ) {
        super(elementRef, renderer);
    }

    /**
     * Show the modal.
     */
    public show(params: {reply: Reply}) {
        this.reply = Object.assign({}, params.reply);
        this.attachments = this.reply.uploads.slice();

        this.textEditor.focus();
        this.textEditor.setContents(this.reply.body);

        super.show(params);
    }

    /**
     * Close note modal.
     */
    public close() {
        super.close();
        this.textEditor.destroyEditor();
    }

    /**
     * Save reply and close modal.
     */
    public confirm() {
        let payload = {body: this.textEditor.getContents(), attachments: this.attachments.map(attachment => attachment['file_name'])};

        this.tickets.updateReply(this.reply.id, payload).subscribe(response => {
            super.done(response.data);
        }, super.handleErrors.bind(this));
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
    public removeAttachment(id: number) {
        for (let i = 0; i < this.attachments.length; i++) {
            if (this.attachments[i]['id'] == id) {
                this.attachments.splice(i, 1);
            }
        }
    }
}

