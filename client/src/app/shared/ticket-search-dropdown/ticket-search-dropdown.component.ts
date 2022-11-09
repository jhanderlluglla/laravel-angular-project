import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {CustomScrollbarDirective} from "../custom-scrollbar/custom-scrollbar.directive";
import {TicketsService} from "../../ticketing/tickets.service";
import {Ticket} from "../models/Ticket";
import {User} from "../models/User";
import {ModalService} from "../modal/modal.service";
import {AgentSearchModalComponent} from "../../ticketing/agent-search-modal/agent-search-modal.component";
import {DropdownComponent} from "../dropdown/dropdown.component";

@Component({
    selector: 'ticket-search-dropdown',
    templateUrl: './ticket-search-dropdown.component.html',
    styleUrls: ['./ticket-search-dropdown.component.scss'],
    providers: [TicketsService],
    encapsulation: ViewEncapsulation.None,
})
export class TicketSearchDropdownComponent implements OnInit {
    @ViewChild(DropdownComponent) dropdown: DropdownComponent;
    @ViewChild(CustomScrollbarDirective) scrollbar: CustomScrollbarDirective;

    /**
     * FormControl bound to search input.
     */
    public searchQuery = new FormControl();

    /**
     * Controls for which category results are currently shown.
     */
    public activeCategory: string = 'tickets';

    /**
     * Whether any results were found on last search.
     */
    public hasResults: boolean = false;

    /**
     * Whether at least one search call to backend was made already.
     */
    public loadedResultsAtLeastOnce = false;

    /**
     * Whether results are currently being loaded from backend.
     */
    public isLoading = false;

    /**
     * Search results.
     */
    public results: {tickets?: {data: Ticket[]}, users?: {data: User[]}} = {tickets: {data: []}, users: {data: []}};

    /**
     * TicketSearchDropdownComponent Constructor.
     */
    constructor(private tickets: TicketsService, private router: Router, private modal: ModalService) {}

    ngOnInit() {
        this.bindToQueryChangeEvent();
    }

    /**
     * Set specified category as active one.
     */
    public setActiveCategory(name: string) {
        this.activeCategory = name;
    }

    /**
     * Open specified ticket route.
     */
    public navigateToTicket(id: number) {
        this.reset();
        this.router.navigate(['/mailbox/tickets', 'tag', 1, 'ticket', id]);
    }

    /**
     * Open specified user route.
     */
    public navigateToUser(id: number) {
        this.reset();
        this.router.navigate(['/mailbox/users', id]);
    }

    /**
     * Open search modal with current search query.
     */
    public openSearchModal() {
        if ( ! this.searchQuery.value) return;
        this.modal.show(AgentSearchModalComponent, {query: this.searchQuery.value});
    }

    /**
     * Search for tickets and users matching specified query.
     */
    private search(query: string = null) {
        this.isLoading = true;

        this.tickets.search(query).subscribe(results => {
            this.hasResults = results.data.tickets.total || results.data.users.total;
            this.loadedResultsAtLeastOnce = true;
            this.results = results.data;
            this.isLoading = false;

            this.dropdown.open();

            //switch to category that has any results
            if ( ! results.data.tickets.total) {
                this.setActiveCategory('users');
            } else {
                this.setActiveCategory('tickets');
            }
        });
    }

    /**
     * Reset component to initial state.
     */
    private reset() {
        this.searchQuery.setValue(null);
        this.hasResults = false;
        this.results = null;
        this.activeCategory = 'tickets';
        this.loadedResultsAtLeastOnce = false;
    }

    /**
     * Bind to search form control and search when user types into input.
     */
    private bindToQueryChangeEvent() {
        this.searchQuery.valueChanges
            .debounceTime(400)
            .distinctUntilChanged()
            .subscribe(query => {
                setTimeout(() => this.scrollbar.update());
                if (query) this.search(query);
            });
    }
}
