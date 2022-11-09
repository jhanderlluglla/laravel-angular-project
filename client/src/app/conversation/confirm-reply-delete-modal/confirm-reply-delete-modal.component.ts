import {Component, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {BaseModalClass} from "../../shared/modal/base-modal";
import {Reply} from "../../shared/models/Reply";

@Component({
    selector: 'confirm-reply-delete-modal',
    templateUrl: './confirm-reply-delete-modal.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ConfirmReplyDeleteModalComponent extends BaseModalClass {

    /**
     * Type of the reply that is to be deleted.
     */
    public type: string;

    /**
     * ConfirmReplyDeleteModalComponent Constructor.
     */
    constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {
        super(elementRef, renderer);
    }

    /**
     * Show the modal.
     */
    public show(params: {reply: Reply}) {
        this.type = this.getDisplayType(params.reply.type);
        super.show();
    }

    public confirm() {
        super.done();
    }

    /**
     * Get display type for reply to be deleted.
     */
    private getDisplayType(type: string): string {
        switch (type) {
            case 'replies':
                return 'reply';
            case 'notes':
                return 'note';
            case 'drafts':
                return 'draft'
        }
    }
}