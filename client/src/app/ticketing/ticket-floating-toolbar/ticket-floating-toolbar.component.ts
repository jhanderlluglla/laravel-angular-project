import {Component, Input, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {TicketsService} from '../tickets.service';
import {MailboxTagsService} from "../mailbox-tags.service";
import {ToastService} from "../../shared/toast/toast.service";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {CurrentUser} from "../../auth/current-user";
import {GroupService} from "../../admin/groups/group.service";
import {Group} from "../../shared/models/Group";

@Component({
    selector: 'ticket-floating-toolbar',
    templateUrl: './ticket-floating-toolbar.component.html',
    styleUrls: ['./ticket-floating-toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TicketFloatingToolbarComponent {

    /**
     * Ids of currently selected tickets;
     */
    @Input() selectedTickets: number[];

    /**
     * Fired when selected tickets have been updated in any way.
     */
    @Output() onTicketsUpdated = new EventEmitter();

    public groups: Group[] = [];

    /**
     * TicketFloatingToolbarComponent Constructor.
     */
    constructor(
        private tickets: TicketsService,
        public mailboxTags: MailboxTagsService,
        private toast: ToastService,
        private modal: ModalService,
        public currentUser: CurrentUser,
        public groupService: GroupService
    ) {}

    /**
     * Delete tickets matching given ids.
     */
    public deleteTickets(ids: number[]) {
        this.tickets.deleteMultiple(ids).subscribe(() => {
            this.ticketsUpdated();
            this.toast.show('Tickets deleted');
        })
    }

    /**
     * Change status of all selected tickets.
     */
    public setStatusForSelectedTickets(tag) {
        this.tickets.changeMultipleTicketsStatus(this.selectedTickets.slice(), tag).subscribe(() => {
            this.ticketsUpdated();
        });
    }

    /**
     * Get all groups.
     */
    public getGroups() {
        this.groupService.getGroups().subscribe(response => {
            this.groups = response.data;
        });
        return this.groups
    }


    /**
     * Assign tickets to group.
     */
    public setGroupForSelectedTickets(group) {
        this.tickets.assignToGroup(this.selectedTickets.slice(), group.id).subscribe(() => {
            this.ticketsUpdated();
        });
    }

    /**
     * Delete selected tickets if user confirms it.
     */
    public maybeDeleteSelectedTickets() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Tickets',
            body:  'Are you sure you want to permanently delete selected tickets?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteTickets(this.selectedTickets.slice()));
    }

    /**
     * Called every time selected tickets are updated in any way.
     */
    public ticketsUpdated() {
        this.onTicketsUpdated.emit();
        this.mailboxTags.refresh();
    }
}
