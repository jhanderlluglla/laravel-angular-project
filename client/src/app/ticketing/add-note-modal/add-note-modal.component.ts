import {Component, ElementRef, Renderer2, ViewChild, OnInit, ViewEncapsulation} from '@angular/core';
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {UploadsService} from "../../shared/uploads.service";
import {TicketsService} from "../tickets.service";
import {BaseModalClass} from "../../shared/modal/base-modal";
import {Conversation} from "../../conversation/conversation.service";

@Component({
    selector: 'add-note-modal',
    templateUrl: './add-note-modal.component.html',
    styleUrls: ['./add-note-modal.component.scss'],
    providers: [Conversation],
    encapsulation: ViewEncapsulation.None,
})
export class AddNoteModalComponent extends BaseModalClass implements OnInit {
    @ViewChild('textEditor') textEditor: TextEditorComponent;

    /**
     * Params passed to modal.
     */
    private params: {ticketId: number};

    /**
     * Files currently attached to this note.
     */
    public attachments: any[] = [];

    constructor(protected elementRef: ElementRef, protected renderer: Renderer2, private ticketService: TicketsService, private uploads: UploadsService) {
        super(elementRef, renderer);
    }

    ngOnInit() {
        this.textEditor.focus()
    }

    /**
     * Show note modal.
     */
    public show(params: {ticketId: number}) {
        this.params = params;
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
     * Save note and close modal.
     */
    public confirm() {
        let payload = {body: this.textEditor.getContents(), attachments: this.attachments.map(attachment => attachment.id)};

        this.ticketService.addNote(this.params.ticketId, payload).subscribe(response => {
            super.done(response.data);
            super.handleErrors();
        }, super.handleErrors.bind(this));
    }

    /**
     * Upload given files to server and push them into attachments array.
     */
    public uploadFiles(files: FileList) {
        this.uploads.uploadFiles(files).subscribe(response => {
            this.attachments = this.attachments.concat(response.data);
        })
    }

    /**
     * Remove attachment with matching ID.
     */
    public removeAttachment(id: number) {
        for (let i = 0; i < this.attachments.length; i++) {
            if (this.attachments[i].id == id) {
                this.attachments.splice(i, 1);
            }
        }
    }
}

