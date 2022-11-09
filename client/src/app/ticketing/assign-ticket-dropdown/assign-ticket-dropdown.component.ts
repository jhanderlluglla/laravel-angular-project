import {Component, Input, Output, EventEmitter, ViewEncapsulation, ElementRef, ViewChild} from '@angular/core';
import {UserService} from "../../admin/users/user.service";
import {CurrentUser} from "../../auth/current-user";
import {TicketsService} from "../tickets.service";
import {ToastService} from "../../shared/toast/toast.service";
import {User} from "../../shared/models/User";
import {Ticket} from "../../shared/models/Ticket";
import {DropdownComponent} from "../../shared/dropdown/dropdown.component";

@Component({
    selector: 'assign-ticket-dropdown',
    templateUrl: './assign-ticket-dropdown.component.html',
    styleUrls: ['./assign-ticket-dropdown.component.scss'],
    providers: [UserService],
    encapsulation: ViewEncapsulation.None,
})
export class AssignTicketDropdownComponent {
    @ViewChild(DropdownComponent) dropdown: DropdownComponent;

    /**
     * List of all active agents.
     */
    public agents: User[] = [];

    /**
     * Ticket that should be re-assigned.
     */
    @Input() ticket: Ticket;

    /**
     * Multiple tickets that should be re-assigned.
     */
    @Input() ticketsIds: number[];

    /**
     * Fired on successful ticket assignment.
     */
    @Output() onAssigned = new EventEmitter();

    /**
     * AssignTicketDropdownComponent Constructor.
     */
    constructor(
        private users: UserService,
        public currentUser: CurrentUser,
        private tickets: TicketsService,
        private toast: ToastService,
        public el: ElementRef
    ) {}

    /**
     * Assign ticket to given agent.
     */
    public assignTicketsTo(userId: number = null) {
        let payload = this.ticketsIds ? this.ticketsIds : [this.ticket.id];

        this.tickets.assign(payload, userId).subscribe(() => {
            if (this.ticket) this.ticket.assigned_to = userId;
            this.toast.show('Tickets assigned');
            this.onAssigned.emit();
        });
    }

    /**
     * Fetch all users belonging to agents group.
     */
    public fetchAgents() {
        this.users.getUsers({group_name: 'agents', per_page: 35}).subscribe((users: User[]) => {
            //filter out currently logged in user as there's already a 'me' dropdown item
            this.agents = users.filter(user => user.id != this.currentUser.get('id'));
        });
    }

    /**
     * Open the dropdown.
     */
    public open() {
        this.dropdown.open();
    }
}
