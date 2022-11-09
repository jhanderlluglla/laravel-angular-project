import {Component, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {Conversation} from "../conversation.service";
import {TicketsService} from "../../ticketing/tickets.service";
import {BaseModalClass} from "../../shared/modal/base-modal";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {Draft} from "../draft.service";
import {ConversationReplies} from "../conversation-replies.service";
import {AfterReplyAction} from "../after-reply-action.service";

@Component({
    selector: 'conversation-modal',
    templateUrl: './conversation-modal.component.html',
    styleUrls: ['./conversation-modal.component.scss'],
    providers: [TicketsService, Conversation, Draft, ConversationReplies, AfterReplyAction],
    encapsulation: ViewEncapsulation.None,
})
export class ConversationModalComponent extends BaseModalClass {

    /**
     * ID of ticket that is currently active behind this modal, if any.
     */
    public activeTicketId: number;

    /**
     * ConversationModalComponent Constructor.
     */
    constructor(
        protected elementRef: ElementRef,
        protected renderer: Renderer2,
        private tickets: TicketsService,
        private modal: ModalService,
        public conversation: Conversation,
    ) {
        super(elementRef, renderer);
    }

    public show(params: {ticketId: number, activeTicketId?: number}) {
        this.activeTicketId = params.activeTicketId;

        this.tickets.get(params.ticketId).subscribe(ticket => {
            this.conversation.init(ticket);
            super.show(params);
        });
    }

    /**
     * Merge currently active ticket with ticket displayed in this modal.
     */
    public mergeTickets() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Merge Tickets',
            body: 'Are you sure you want merge this ticket with the original one behind the pop-ups?',
            bodyBold: 'Merged tickets can not be unmerged.',
            ok: 'Merge'
        }).onDone.subscribe(() => {
            this.tickets.merge(this.activeTicketId, this.conversation.get().id).subscribe(ticket => {
                this.close(ticket);
            });
        })
    }
}