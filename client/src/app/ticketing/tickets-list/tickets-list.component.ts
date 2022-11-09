import {Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, Input, Injector} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {MailboxTagsService} from "../mailbox-tags.service";
import {CustomScrollbarDirective} from "../../shared/custom-scrollbar/custom-scrollbar.directive";
import {Subscription} from "rxjs";
import {DataTable} from "../../shared/data-table";
import {Ticket} from "../../shared/models/Ticket";
import {ModalService} from "../../shared/modal/modal.service";
import {ConversationModalComponent} from "../../conversation/conversation-modal/conversation-modal.component";
import {BackendEvents} from "../../shared/backend-events";

@Component({
    selector: 'tickets-list',
    templateUrl: './tickets-list.component.html',
    styleUrls: ['./tickets-list.component.scss'],
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None,
})
export class TicketsListComponent extends DataTable implements OnInit, OnDestroy {
    @ViewChild(CustomScrollbarDirective) scrollbar: CustomScrollbarDirective;

    /**
     * Whether tickets should be fetched from backend on component init.
     */
    @Input() public fetchTickets: boolean = true;

    /**
     * Whether ticket should be opened in modal or ticket route.
     */
    @Input() public openTicketInModal: boolean = false;

    /**
     * Tickets to render.
     */
    @Input() items: Ticket[] = [];


    /**
     * Tickets to render.
     */
    @Input() categories_info = [];

    /**
     * List of subscriptions to unsub on component destroy.
     */
    private subscription: Subscription;

    /**
     * TicketsListComponent Constructor.
     */
    constructor(
        private mailboxTags: MailboxTagsService,
        private router: Router,
        private modal: ModalService,
        private injector: Injector,
        private route: ActivatedRoute,
        private backendEvents: BackendEvents,
    ) {
        super();
    }

    ngOnInit() {
        this.paginator = new UrlAwarePaginator(this.injector);

        this.route.params.subscribe(params => {
            this.refreshPaginator({tag_id: params['tag_id'] || this.mailboxTags.getTagByName('open') && this.mailboxTags.getTagByName('open').id});
        });

        this.bindToBackendEvents();
    }

    /**
     * Fetch new tickets list form server and deselect all tickets.
     */
    public refreshTicketsList() {
        this.deselectAllItems();
        this.paginator.refresh();
    }

    /**
     * Navigate to specified ticket route.
     */
    public openConversation(ticketId: number) {
        if (this.openTicketInModal) {
            this.modal.show(ConversationModalComponent, {ticketId}, this.injector);
        } else {
            if (this.router.url.indexOf('/mailbox') >= 0 && this.mailboxTags) {
                this.router.navigate(['/mailbox/tickets/tag', this.mailboxTags.getActiveTagId(), 'ticket', ticketId]);
            }
            else {
                this.router.navigateByUrl(`${this.router.url}/ticket/${ticketId}`);
            }
        }
    }

    /**
     * Return latest reply body for specified ticket.
     */
    public getTicketBody(ticket: Ticket): string {
        if (ticket.latest_reply && ticket.latest_reply.body) {
            return ticket.latest_reply.body;
        }

        if (ticket.replies && ticket.replies.length) {
            return ticket.replies[0].body;
        }
    }

    /**
     * Refresh tickets paginator.
     */
    private refreshPaginator(params: Object) {
        if ( ! this.fetchTickets) return;
        this.subscription = this.paginator.paginate('tickets', params).subscribe(response => {
            this.items = response.data.map(ticket => {
                if (!ticket.tags.find(tag => tag.name.toLowerCase() == 'agent created') && !ticket.tags.find(tag => tag.name.toLowerCase() == 'email')) {
                    ticket.tags.push({
                        id: 10,
                        type: 'default',
                        name: 'Email',
                        display_name: 'Email',
                    });
                }
                return ticket;
            });
            this.categories_info = response.categories_info ? response.categories_info : [];
            setTimeout(() => this.scrollbar.setScrollTop());
        });
    }

    /**
     * Bind to ticket created backend event via websockets.
     */
    private bindToBackendEvents() {
        this.backendEvents.ticketCreated.subscribe((newTicket: Ticket) => {

            //if new ticket does not have currently active status, bail
            if ( ! newTicket.tags || ! newTicket.tags.find(tag => tag.id == this.mailboxTags.getActiveTagId())) return;

            //if ticket is already in tickets list, bail
            if (this.items.find((ticket) => ticket.id == newTicket.id)) return;

            //add new ticket to tickets list and refresh mailbox tags
            newTicket['animated'] = true;
            this.items.unshift(newTicket);
            this.mailboxTags.refresh();
        });
    }

    ngOnDestroy() {
        this.paginator && this.paginator.destroy();
        this.subscription && this.subscription.unsubscribe();
    }
}
