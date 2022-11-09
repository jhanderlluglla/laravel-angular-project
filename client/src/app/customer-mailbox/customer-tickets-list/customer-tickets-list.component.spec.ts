import {KarmaTest} from "../../../../testing/karma-test";
import {CustomerTicketsListComponent} from "./customer-tickets-list.component";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {HcCompactHeaderComponent} from "../../help-center/front/hc-compact-header/hc-compact-header.component";
import {CustomerFooterComponent} from "../../shared/customer-footer/customer-footer.component";
import {NoResultsMessageComponent} from "../../shared/no-results-message/no-results-message.component";
import {PaginationControlsComponent} from "../../shared/pagination/pagination-controls/pagination-controls.component";
import {HighlightOpenTicketDirective} from "../../ticketing/tickets-list/highlight-open-ticket-directive";
import {CustomerNavbarComponent} from "../../shared/customer-navbar/customer-navbar.component";
import {SuggestedArticlesDropdownComponent} from "../../help-center/front/suggested-articles-dropdown/suggested-articles-dropdown.component";
import {LoggedInUserWidgetComponent} from "../../shared/logged-in-user-widget/logged-in-user-widget.component";
import {CurrentUser} from "../../auth/current-user";
import {BehaviorSubject} from "rxjs";
import {LoadingIndicatorComponent} from "../../shared/loading-indicator/loading-indicator.component";
import {CustomMenuComponent} from "../../shared/custom-menu/custom-menu.component";

describe('CustomerTicketsListComponent', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    CustomerTicketsListComponent, CustomerFooterComponent, HcCompactHeaderComponent, HcCompactHeaderComponent,
                    NoResultsMessageComponent, PaginationControlsComponent, HighlightOpenTicketDirective, CustomerNavbarComponent,
                    SuggestedArticlesDropdownComponent, LoggedInUserWidgetComponent, LoadingIndicatorComponent, CustomMenuComponent,
                ],
                providers: [UrlAwarePaginator],
            },
            component: CustomerTicketsListComponent
        });
    });

    it('starts tickets paginator on init', () => {
        spyOn(testBed.get(CurrentUser), 'get').and.returnValue(99);
        spyOn(testBed.get(UrlAwarePaginator), 'paginate').and.returnValue(new BehaviorSubject(null));

        testBed.fixture.detectChanges();

        //gets current user ID
        expect(testBed.get(CurrentUser).get).toHaveBeenCalledWith('id');

        //paginates user tickets
        expect(testBed.get(UrlAwarePaginator).paginate).toHaveBeenCalledWith('users/'+99+'/tickets');

        //sets subscribtion on componet
        expect(testBed.component.sub).toBeTruthy();
        expect(testBed.component.sub.closed).toEqual(false);
    });

    it('unsubscribes on component destroy', () => {
        spyOn(testBed.get(CurrentUser), 'get');
        spyOn(testBed.get(UrlAwarePaginator), 'paginate').and.returnValue(new BehaviorSubject(null));

        testBed.fixture.detectChanges();
        testBed.component.ngOnDestroy();

        expect(testBed.component.sub.closed).toEqual(true);
    });

    it('renders tickets list', () => {
        spyOn(testBed.get(CurrentUser), 'get');
        spyOn(testBed.get(UrlAwarePaginator), 'paginate').and.returnValue(new BehaviorSubject(null));
        testBed.get(UrlAwarePaginator).data = [
            {id: 1, subject: 'foo', latest_reply: {body: 'bar'}, updated_at_formatted: 'date', replies_count: 99, tags: [{name: 'open'}, {name: 'category', display_name: 'category', type: 'category'}]},
            {tags: [{name: 'foo'}], replies_count: 1},
        ];

        testBed.fixture.detectChanges();
        let tickets = testBed.findAll('.ticket');

        //renders both tickets
        expect(tickets.length).toEqual(2);

        //adds open class to tickets that are not closed
        expect(tickets[0].classList.contains('open')).toEqual(true);
        expect(tickets[1].classList.contains('open')).toEqual(false);

        //renders router link
        expect(tickets[0]['href']).toContain('help-center/tickets/1');

        //renders ticket subject
        expect(tickets[0].querySelector('.subject').textContent).toEqual('foo');

        //renders ticket earliest reply body
        expect(tickets[0].querySelector('.ticket-body').textContent).toEqual('bar');

        //renders ticket "updated_at" date
        expect(tickets[0].querySelector('.date').textContent).toEqual('date');

        //renders ticket replies count in singular and plural formats
        expect(tickets[0].querySelector('.replies_count').textContent).toContain('99');
        expect(tickets[0].querySelector('.replies_count').textContent).toContain('Replies');
        expect(tickets[1].querySelector('.replies_count').textContent).toContain('1');
        expect(tickets[1].querySelector('.replies_count').textContent).toContain('Reply');

        //renders ticket tags
        expect(tickets[0].querySelectorAll('.tag-label').length).toEqual(1);
        expect(tickets[0].querySelectorAll('.tag-label')[0].textContent).toEqual('category');
    });

    it('hides "no results" message if paginator has results', () => {
        spyOn(testBed.component.paginator, 'doesNotHaveResults').and.returnValue(false);
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(NoResultsMessageComponent)).toBeFalsy();
    });

    it('shows "no results" message if paginator has no results', () => {
        spyOn(testBed.component.paginator, 'doesNotHaveResults').and.returnValue(true);

        testBed.fixture.detectChanges();

        //renders "no results" component
        expect(testBed.getChildComponent(NoResultsMessageComponent)).toBeTruthy();

        //passes messages to "no results" component
        expect(testBed.find('no-results-message .main').textContent).toEqual(jasmine.any(String));
        expect(testBed.find('no-results-message .secondary').textContent).toEqual(jasmine.any(String));
    });

    it('renders pagination controls component', () => {
        testBed.fixture.detectChanges();

        //renders pagination controls
        expect(testBed.getChildComponent(PaginationControlsComponent)).toBeTruthy();

        //binds paginator to pagination controls
        expect(testBed.getChildComponent(PaginationControlsComponent).paginator).toBeTruthy();

        //binds items name to pagination controls
        expect(testBed.getChildComponent(PaginationControlsComponent).itemsName).toEqual('Tickets');

        //binds "perPage" to pagination controls
        expect(testBed.getChildComponent(PaginationControlsComponent).defaultPerPage).toEqual(15);
    });
});