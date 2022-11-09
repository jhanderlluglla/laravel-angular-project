import {Component, ElementRef, Renderer2, ViewEncapsulation, ChangeDetectionStrategy} from '@angular/core';
import {BaseModalClass} from "../../../shared/modal/base-modal";

@Component({
    selector: 'show-original-reply-modal',
    templateUrl: './show-original-reply-modal.component.html',
    styleUrls: ['./show-original-reply-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowOriginalReplyModalComponent extends BaseModalClass {

    /**
     * Original email from which reply was created.
     */
    public originalEmail: {headers: any, body: {plain: string, html: string}};

    /**
     * Names of all email headers.
     */
    public headerNames: string[] = [];

    /**
     * ShowOriginalReplyModal Constructor.
     */
    constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {
        super(elementRef, renderer);
    }

    /**
     * Show the modal.
     */
    public show(params) {
        this.originalEmail = params.original;

        if (this.originalEmail && this.originalEmail.headers) {
            this.headerNames = Object.keys(this.originalEmail.headers);
        }

        super.show(params);
    }
}

