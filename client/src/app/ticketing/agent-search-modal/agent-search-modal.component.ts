import {Component, ElementRef, Injector, Renderer2, ViewChild, ViewEncapsulation} from '@angular/core';
import {BaseModalClass} from "../../shared/modal/base-modal";
import {TicketsService} from "../tickets.service";
import {Ticket} from "../../shared/models/Ticket";
import {User} from "../../shared/models/User";
import {FormControl} from "@angular/forms";
import {CustomScrollbarDirective} from "../../shared/custom-scrollbar/custom-scrollbar.directive";
import {Article} from "../../shared/models/Article";
import {HcUrls} from "../../help-center/shared/hc-urls.service";
import {Paginator} from "../../shared/pagination/paginator.service";

@Component({
    selector: 'agent-search-modal',
    templateUrl: './agent-search-modal.component.html',
    styleUrls: ['./agent-search-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AgentSearchModalComponent extends BaseModalClass {
    @ViewChild(CustomScrollbarDirective) scrollbar: CustomScrollbarDirective;

    /**
     * FormControl bound to search input.
     */
    public searchQueryControl = new FormControl();

    /**
     * Latest search results.
     */
    public results: {tickets?: Ticket[], users?: User[], articles?: Article[]} = {tickets: [], users: [], articles: []};


    /**
     * Whether search is currently in progress.
     */
    public isSearching: boolean = false;

    /**
     * Whether latest search has returned any results.
     */
    private hasResults: boolean|null = null;

    /**
     * Currently active tab.
     */
    private activeTab: string = 'tickets';

    /**
     * UrlAwarePaginators for all searchable objects.
     */
    public paginators = {
        tickets: <Paginator>null,
        articles: <Paginator>null,
        users: <Paginator>null,
    };

    /**
     * AgentSearchModalComponent Constructor.
     */
    constructor(
        protected elementRef: ElementRef,
        protected renderer: Renderer2,
        private tickets: TicketsService,
        private injector: Injector,
        public urls: HcUrls,
    ) {
        super(elementRef, renderer);
        this.closeModalOnBackdropClick = false;
    }

    /**
     * Show the modal.
     */
    public show(params: {query: string}) {
        this.bindToSearchInput();
        this.searchQueryControl.setValue(params.query);
        this.createUrlAwarePaginators();
        super.show(params);
    }

    /**
     * Set specified tab as active.
     */
    public setActiveTab(name: string) {
        this.activeTab = name;
    }

    /**
     * Check if specified tab is currently active.
     */
    public activeTabIs(name: string) {
        return this.activeTab === name;
    }

    /**
     * Search for tickets and users matching specified query.
     */
    private performSearch(query: string) {
        this.isSearching = true;

        this.tickets.search(query, {detailed: true, per_page: 20}).subscribe(results => {
            this.results = results.data;
            this.isSearching = false;
            this.updateUrlAwarePaginators(results.data);
            this.openFirstTabWithResults();
        });
    }

    /**
     * Open first search tab that has any results.
     */
    private openFirstTabWithResults() {
        ['tickets', 'users', 'articles'].some(type => {
            if (this.results[type] && this.results[type]['total']) {
                this.setActiveTab(type);
                return true;
            }
        });
    }

    /**
     * Create static paginator isntances for all searchable objects.
     */
    private createUrlAwarePaginators() {
        for (let name in this.paginators) {
            this.paginators[name] = new Paginator(this.injector);
            this.paginators[name].serverUri = 'search/' + name + '/' + this.searchQueryControl.value;
            this.paginators[name].staticQueryParams['detailed'] = true;
            this.paginators[name].onNavigate.subscribe(response => {
                this.results[name] = response;
                this.scrollbar.setScrollTop();
            });
        }
    }

    /**
     * Update static paginators with specified pagination info from server.
     */
    private updateUrlAwarePaginators(results) {
        for (let name in this.paginators) {
            this.paginators[name].setParams(results[name]);
        }
    }

    /**
     * Bind to search form control and search when user types into input.
     */
    private bindToSearchInput() {
        this.searchQueryControl.valueChanges
            .debounceTime(400)
            .distinctUntilChanged()
            .subscribe(query => {
                setTimeout(() => this.scrollbar.update());
                return this.performSearch(query);
            });
    }
}
