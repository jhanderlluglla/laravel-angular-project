import {KarmaTest} from "../../../../testing/karma-test";
import {AgentSearchModalComponent} from "./agent-search-modal.component";
import {LoadingIndicatorComponent} from "../../shared/loading-indicator/loading-indicator.component";
import {PaginationControlsComponent} from "../../shared/pagination/pagination-controls/pagination-controls.component";
import {MailboxTagsService} from "../mailbox-tags.service";
import {TicketsListComponent} from "../tickets-list/tickets-list.component";
import {HighlightOpenTicketDirective} from "../tickets-list/highlight-open-ticket-directive";
import {TicketFloatingToolbarComponent} from "../ticket-floating-toolbar/ticket-floating-toolbar.component";
import {AssignTicketDropdownComponent} from "../assign-ticket-dropdown/assign-ticket-dropdown.component";
import {AddTagDropdownComponent} from "../add-tag-dropdown/add-tag-dropdown.component";
import {TicketsService} from "../tickets.service";
import {HcUrls} from "../../help-center/shared/hc-urls.service";
import {TagService} from "../../shared/tag.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {fakeAsync, tick} from "@angular/core/testing";
import {NoResultsMessageComponent} from "../../shared/no-results-message/no-results-message.component";
import {BackendEvents} from "../../shared/backend-events";

describe('AgentSearchModalComponent', () => {
    let testBed: KarmaTest<AgentSearchModalComponent>;

    beforeEach(() => {
        testBed = new KarmaTest<AgentSearchModalComponent>({
            module: {
                declarations: [
                    AgentSearchModalComponent, LoadingIndicatorComponent, PaginationControlsComponent,
                    TicketsListComponent, HighlightOpenTicketDirective, TicketFloatingToolbarComponent,
                    AssignTicketDropdownComponent, AddTagDropdownComponent, NoResultsMessageComponent,
                ],
                providers: [MailboxTagsService, TicketsService, HcUrls, TagService, BackendEvents],
            },
            component: AgentSearchModalComponent,
        });

        testBed.get(MailboxTagsService).allTags = [testBed.fake('Tag', 1, {name: 'open'})];
    });

    it('shows the modal', () => {
        testBed.component.show({query: 'foo'});

        //sets search query
        expect(testBed.component.searchQueryControl.value).toEqual('foo');

        //creates paginators
        expect(testBed.component.paginators.tickets.serverUri).toContain('foo');
        expect(testBed.component.paginators.tickets.staticQueryParams).toEqual(jasmine.objectContaining({detailed: true}));
    });

    it('performs a search', fakeAsync(() => {
        let response: any = {data: {tickets: {foo: 'bar', total: 99}}};
        spyOn(testBed.get(TicketsService), 'search').and.returnValue(new BehaviorSubject(response));
        testBed.component.setActiveTab('users');
        testBed.fixture.detectChanges();
        testBed.component.show({query: 'bar'});

        testBed.typeIntoEl('.search-input input', 'foo');
        tick(401);

        //calls backend
        expect(testBed.get(TicketsService).search).toHaveBeenCalledWith('foo', {detailed: true, per_page: jasmine.any(Number)});

        //sets results on component
        expect(testBed.component.results).toEqual(response.data);
        expect(testBed.component.isSearching).toEqual(false);

        //updates paginators
        expect(testBed.component.paginators.tickets.params.total).toEqual(99);

        //opens tickets tab
        expect(testBed.component.activeTabIs('tickets')).toEqual(true);
    }));

    it('renders tabs', () => {
        testBed.component.setActiveTab('users');
        testBed.fixture.detectChanges();

        //sets menu item as active
        expect(testBed.component.activeTabIs('users')).toEqual(true);
        expect(testBed.find('.users-menu-item').classList.contains('active')).toEqual(true);
        expect(testBed.find('.tickets-menu-item').classList.contains('active')).toEqual(false);
        expect(testBed.find('.articles-menu-item').classList.contains('active')).toEqual(false);

        //toggles tab
        expect(testBed.find('.users-tab').classList.contains('hidden')).toEqual(false);
        expect(testBed.find('.tickets-tab').classList.contains('hidden')).toEqual(true);
        expect(testBed.find('.articles-tab').classList.contains('hidden')).toEqual(true);
    });

    it('renders tickets tab', fakeAsync(() => {
        testBed.component.results.tickets['data'] = testBed.fake('Ticket', 2);
        testBed.component.show({query: 'foo'});
        testBed.fixture.detectChanges();
        tick(401);

        //renders "TicketsList" component
        expect(testBed.getChildComponent(TicketsListComponent).fetchTickets).toEqual(false);
        expect(testBed.getChildComponent(TicketsListComponent).openTicketInModal).toEqual(true);
        expect(testBed.getChildComponent(TicketsListComponent).items).toEqual(testBed.component.results.tickets['data']);

        //renders paginator
        expect(testBed.findDebugEl('.tickets-tab pagination-controls').componentInstance).toBeTruthy();
    }));

    it('renders users tab', () => {
        testBed.component.results.users['data'] = testBed.fake('User', 2);
        testBed.fixture.detectChanges();

        //renders both users
        expect(testBed.findAll('.user').length).toEqual(2);

        //renders link
        expect(testBed.find('.user')['href']).toContain('users/'+testBed.component.results.users['data'][0].id);

        //renders user
        expect(testBed.find('.user .avatar')['src']).toEqual(testBed.component.results.users['data'][0].avatar);
        expect(testBed.find('.user .title').textContent.trim()).toEqual(testBed.component.results.users['data'][0].display_name);
        expect(testBed.find('.user .body').textContent.trim()).toEqual(testBed.component.results.users['data'][0].email);
    });

    it('renders articles tab', fakeAsync(() => {
        testBed.component.results.articles['data'] = testBed.fake('Article', 2);
        testBed.component.show({query: 'foo'});
        testBed.fixture.detectChanges();
        tick(401);

        //renders both articles
        expect(testBed.findAll('.article').length).toEqual(2);

        //renders link
        expect(testBed.find('.article')['href']).toContain(testBed.component.results.articles['data'][0].id);

        //renders article
        expect(testBed.find('.article .title').textContent.trim()).toEqual(testBed.component.results.articles['data'][0].title);
        expect(testBed.find('.article .body').textContent.trim()).toEqual(testBed.component.results.articles['data'][0].body);

        //renders paginator
        expect(testBed.findDebugEl('.tickets-tab pagination-controls').componentInstance).toBeTruthy();
    }));
});