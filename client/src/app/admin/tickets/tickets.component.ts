import {Component, Injector, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Ticket} from "../../shared/models/Ticket";
import {Paginator} from "../../shared/pagination/paginator.service";
import {TicketsService} from "../../ticketing/tickets.service";
import {CurrentUser} from "../../auth/current-user";

@Component({
    selector: 'tickets',
    templateUrl: './tickets.component.html',
    styleUrls: ['./tickets.component.scss'],
    providers: [TicketsService],
    encapsulation: ViewEncapsulation.None,
})
export class TicketsComponent implements OnInit {

    /**
     * User tickets paginator instance.
     */
    public paginator: Paginator;

    /**
     * TicketsComponent Constructor.
     */
    constructor(
        protected ticket: TicketsService,
        private route: ActivatedRoute,
        private injector: Injector,
        public currentUser: CurrentUser,
    ) {}

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.createTicketsPaginator(data);
        });
    }

    /**
     * Create user tickets paginator from specified data.
     */
    private createTicketsPaginator(data) {
        this.paginator = new Paginator(this.injector);
        this.paginator.data = data['tickets'];
    }
}
