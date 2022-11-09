import {Component, Input, Output, ChangeDetectionStrategy, EventEmitter, OnInit, ViewEncapsulation} from "@angular/core";
import {FileMime} from "../file-mime.service";
import {ModalService} from "../modal/modal.service";
import {FilePreviewModalComponent} from "../file-preview/file-preview-modal.component";
import {Upload} from "../models/Upload";

@Component({
    selector: 'attachments-list',
    templateUrl: './attachments-list.component.html',
    styleUrls: ['./attachments-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FileMime],
    encapsulation: ViewEncapsulation.None,
})

export class AttachmentsListComponent implements OnInit {

    /**
     * List of attachments to display.
     */
    @Input() attachments: Upload[];

    /**
     * Fired when user clicks remove attachment button.
     */
    @Output() onRemoveAttachment: EventEmitter<number> = new EventEmitter();

    /**
     * Whether 'remove' attachment button is visible.
     */
    private closeButtonIsVisible = false;

    /**
     * AttachmentsListComponent Constructor.
     */
    constructor(public mime: FileMime, private modal: ModalService) {}

    ngOnInit() {
        //only show 'remove attachment' button if some one is listening for 'onRemoveAttachment' event
        this.closeButtonIsVisible = this.onRemoveAttachment.observers.length > 0;
    }

    /**
     * Show preview modal of specified file.
     */
    public showPreviewModal(params: Object) {
        this.modal.show(FilePreviewModalComponent, params);
    }

    /**
     * Remove attachment with specified ID.
     */
    public removeAttachment(id: number) {
        this.onRemoveAttachment.emit(id);
    }
}
