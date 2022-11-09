import {Component, OnInit, ViewEncapsulation, OnDestroy} from '@angular/core';
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {CurrentUser} from "../../auth/current-user";
import {Subscription} from "rxjs";

@Component({
    selector: 'customer-tickets-list',
    templateUrl: './customer-tickets-list.component.html',
    styleUrls: ['./customer-tickets-list.component.scss'],
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None,
})
export class CustomerTicketsListComponent implements OnInit, OnDestroy {

    /**
     * Tickets paginator subscription.
     */
    private sub: Subscription;

    /**
     * CustomerTicketsListComponent Constructor.
     */
    constructor(public paginator: UrlAwarePaginator, public currentUser: CurrentUser) {}

    ngOnInit() {
        this.initTicketsList();
    }

    /**
     * Bootstrap tickets list component and required services.
     */
    private initTicketsList() {
        let id  = this.currentUser.get('id');
        this.sub = this.paginator.paginate('users/'+id+'/tickets').subscribe();
    }

    ngOnDestroy() {
        this.sub && this.sub.unsubscribe();
    }
}
