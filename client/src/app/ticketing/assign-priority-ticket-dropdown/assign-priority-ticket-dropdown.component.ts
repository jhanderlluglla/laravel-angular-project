import {Component, Input, Output, EventEmitter, ViewEncapsulation, ElementRef, ViewChild} from '@angular/core';
import {PrioritiesService} from "../../admin/priorities/priorities.service";
import {CurrentUser} from "../../auth/current-user";
import {TicketsService} from "../tickets.service";
import {ToastService} from "../../shared/toast/toast.service";
import {Priority} from "../../shared/models/Priority";
import {Ticket} from "../../shared/models/Ticket";
import {DropdownComponent} from "../../shared/dropdown/dropdown.component";

@Component({
    selector: 'assign-priority-ticket-dropdown',
    templateUrl: './assign-priority-ticket-dropdown.component.html',
    styleUrls: ['./assign-priority-ticket-dropdown.component.scss'],
    providers: [PrioritiesService],
    encapsulation: ViewEncapsulation.None,
})
export class AssignPriorityTicketDropdownComponent {
    @ViewChild(DropdownComponent) dropdown: DropdownComponent;

    /**
     * List of all active agents.
     */
    public priorities: Priority[] = [];

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
    @Output() onPriorityAssigned = new EventEmitter();

    /**
     * AssignPriorityTicketDropdownComponent Constructor.
     */
    constructor(
        private prioritySerivce: PrioritiesService,
        public currentUser: CurrentUser,
        private tickets: TicketsService,
        private toast: ToastService,
        public el: ElementRef
    ) {}

    /**
     * Assign ticket to given agent.
     */
    public assignTicketsTo(priorityId: number = null) {
        let payload = this.ticketsIds ? this.ticketsIds : [this.ticket.id];

        this.tickets.assignPriority(payload, priorityId).subscribe(() => {
            if (this.ticket) this.ticket.assigned_to = priorityId;
            this.toast.show('Tickets Priority assigned');
            this.onPriorityAssigned.emit();
        });
    }

    /**
     * Fetch all users belonging to agents group.
     */
    public fetchPriorities() {
        this.prioritySerivce.getPriorities({per_page: 35}).subscribe((response) => {
            
            this.priorities = response;
        });
    }

    /**
     * Open the dropdown.
     */
    public open() {
        this.dropdown.open();
    }
}
