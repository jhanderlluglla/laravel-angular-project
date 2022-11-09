import {Component, Output, EventEmitter, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {Upload} from "../models/Upload";
import {BaseModalClass} from "../modal/base-modal";

@Component({
    selector: 'file-preview-modal',
    templateUrl: './file-preview-modal.component.html',
    styleUrls: ['./file-preview-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class FilePreviewModalComponent extends BaseModalClass {
    @Output() public onDone  = new EventEmitter();
    @Output() public onClose = new EventEmitter();

    /**
     * Files to load into preview modal.
     */
    public files: Upload[];

    /**
     * Index of file that should be displayed by default.
     */
    public index = 0;

    /**
     * FilePreviewModal Constructor.
     */
    constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {
        super(elementRef, renderer);
    }

    /**
     * Show modal with specified files.
     */
    public show(params: {files: Upload[], current: Upload}) {
        for (let i = 0; i < params.files.length; i++) {
            if (params.files[i].id == params.current.id) this.index = i;
        }

        this.files = params.files;
        super.show(params);
    }
}