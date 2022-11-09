import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ModalService} from "../../shared/modal/modal.service";
import {ConversationModalComponent} from "../conversation-modal/conversation-modal.component";
import {User} from "../../shared/models/User";
import {Ticket} from "../../shared/models/Ticket";
import {Conversation} from "../conversation.service";
import {TicketsService} from "../../ticketing/tickets.service";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'conversation-sidebar',
    templateUrl: './conversation-sidebar.component.html',
    styleUrls: ['./conversation-sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ConversationSidebarComponent implements OnInit {

    /**
     * User who has created currently active ticket.
     */
    public requester: User;

    /**
     * List of user tickets except currently active ticket.
     */
    public otherTickets: Ticket[];

    /**
     * Controls if previous tickets list is visible.
     */
    public previousTicketsVisible = true;

    /**
     * ConversationSidebar Constructor.
     */
    constructor(
        private modal: ModalService,
        private tickets: TicketsService,
        private conversation: Conversation,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.getUserTicketsExceptCurrent(data['ticket']);
        });
    }

    /**
     * Show given ticket in a modal.
     */
    public openTicketModal(ticketId: number) {
        let params = {ticketId: ticketId, activeTicketId: this.conversation.get().id};

        //if tickets were merged, set merged ticket on conversation
        //service and remove merged ticket from sidebar
        this.modal.show(ConversationModalComponent, params).onClose.subscribe(mergedTicket => {
            if ( ! mergedTicket) return;
            this.otherTickets = this.otherTickets.filter(ticket => ticket.id != ticketId);
            this.conversation.init(mergedTicket);
        });
    }

    /**
     * Get tickets (except currently active one) of active ticket requester.
     */
    private getUserTicketsExceptCurrent(activeTicket: Ticket) {
        this.requester = activeTicket.user;

        if ( ! this.requester) return;

        this.tickets.getTickets({user_id: this.requester.id, per_page: 6}).subscribe(response => {
            this.otherTickets = response.data.filter(ticket => {
                //skip currently open ticket
                return ticket.id != activeTicket.id;
            })
        });
    }
}
