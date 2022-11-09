import {KarmaTest} from "../../../../testing/karma-test";
import {TicketsListComponent} from "./tickets-list.component";
import {PaginationControlsComponent} from "../../shared/pagination/pagination-controls/pagination-controls.component";
import {LoadingIndicatorComponent} from "../../shared/loading-indicator/loading-indicator.component";
import {TicketFloatingToolbarComponent} from "../ticket-floating-toolbar/ticket-floating-toolbar.component";
import {HighlightOpenTicketDirective} from "./highlight-open-ticket-directive";
import {AddTagDropdownComponent} from "../add-tag-dropdown/add-tag-dropdown.component";
import {AssignTicketDropdownComponent} from "../assign-ticket-dropdown/assign-ticket-dropdown.component";
import {TicketsService} from "../tickets.service";
import {MailboxTagsService} from "../mailbox-tags.service";
import {TagService} from "../../shared/tag.service";
import {BehaviorSubject} from "rxjs";
import {fakeAsync, tick} from "@angular/core/testing";
import {ActivatedRoute, Router} from "@angular/router";
import {NoResultsMessageComponent} from "../../shared/no-results-message/no-results-message.component";
import {ActivatedRouteStub} from "../../../../testing/stubs/activated-route-stub";
import {BackendEvents} from "../../shared/backend-events";
import {modelFactory} from "../../../../testing/model-factory";

describe('TicketsListComponent', () => {
    let testBed: KarmaTest<any>;
    let scrollbar = {setScrollTop: function() {}};

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    TicketsListComponent, PaginationControlsComponent, LoadingIndicatorComponent, TicketFloatingToolbarComponent,
                    HighlightOpenTicketDirective, AddTagDropdownComponent, AssignTicketDropdownComponent, NoResultsMessageComponent,
                ],
                providers: [TicketsService, MailboxTagsService, BackendEvents, TagService, {provide: ActivatedRoute, useClass: ActivatedRouteStub}],
            },
            component: TicketsListComponent
        });

        testBed.component.scrollbar = scrollbar;
        testBed.get(MailboxTagsService).setTags([modelFactory.make('Tag', 1, {name: 'open'})]);
    });

    it('initiates tickets list', fakeAsync(() => {
        const tickets = testBed.fake('Ticket', 2);
        testBed.fixture.detectChanges();
        spyOn(testBed.component.paginator, 'paginate').and.returnValue(new BehaviorSubject({data: tickets}));
        spyOn(scrollbar, 'setScrollTop');

        testBed.get(ActivatedRoute)['testParams'] = {tag_id: 1};
        testBed.fixture.detectChanges();

        //paginates tickets
        expect(testBed.component.paginator.paginate).toHaveBeenCalledWith('tickets', {tag_id: 1});

        //tickets were set on component instance
        expect(testBed.component.items).toEqual(tickets);

        //page was scrolled to top after tickets were loaded
        tick(100);
        expect(scrollbar.setScrollTop).toHaveBeenCalledTimes(1);

        //does not add new ticket via backend events if ticket
        //has different status then currently active status
        let ticket1 = modelFactory.make('Ticket');
        testBed.get(BackendEvents).ticketCreated.emit(ticket1);
        expect(testBed.component.items).not.toContain(ticket1);

        //does not add new ticket via backend events if ticket
        //is already in tickets list
        const ticket2 = modelFactory.make('Ticket');
        testBed.component.items.push(ticket2);
        const oldLength = testBed.component.items.length;
        testBed.get(BackendEvents).ticketCreated.emit(ticket2);
        expect(testBed.component.items.length).toEqual(oldLength);

        //adds new ticket via backend events
        let ticket3 = modelFactory.make('Ticket', 1, {tags: [{name: 'open'}]});
        testBed.get(BackendEvents).ticketCreated.emit(ticket3);
        expect(testBed.component.items).toContain(ticket3);
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.ticket')[1].classList.contains('bounce')).toBeTruthy();
    }));

    it('does not fetch tickets from server if option is specified', () => {
        testBed.fixture.detectChanges();
        spyOn(testBed.component.paginator, 'paginate');
        testBed.component.fetchTickets = false;

        testBed.fixture.detectChanges();

        expect(testBed.component.paginator.paginate).not.toHaveBeenCalled();
    });

    it('destroys paginator when component is destroyed', () => {
        testBed.get(ActivatedRoute)['testParams'] = {id: 1};
        testBed.fixture.detectChanges();

        //destroys paginator
        spyOn(testBed.component.paginator, 'destroy');
        testBed.component.ngOnDestroy();
        expect(testBed.component.paginator.destroy).toHaveBeenCalledTimes(1);

        //unsubscribes from paginator
        expect(testBed.component.subscription.closed).toEqual(true);
    });

    it('toggles all tickets', () => {
        spyOn(testBed.component, 'toggleAllSelectedItems');
        testBed.find('#toggle-all-tickets-checkbox').click();
        expect(testBed.component.toggleAllSelectedItems).toHaveBeenCalledTimes(1);
    });

    it('renders tickets list', () => {
        const tickets = [testBed.fake('Ticket', 1, {tags: [testBed.fake('Tag', 1, {type: 'status'}), testBed.fake('Tag', 1, {name: 'open'})]}), testBed.fake('Ticket')];
        testBed.component.items = tickets;
        testBed.fixture.detectChanges();

        //all tickets are rendered
        expect(testBed.findAll('.ticket-row').length).toEqual(2);

        //adds 'selected' class to selected tickets
        testBed.component.selectedItems = [tickets[0].id];
        testBed.fixture.detectChanges();
        expect(testBed.find('.ticket-row').classList.contains('selected')).toEqual(true);

        //opens conversation page on ticket click
        spyOn(testBed.get(Router), 'navigate');
        spyOn(testBed.get(MailboxTagsService), 'getActiveTagId').and.returnValue(1);

        testBed.find('.ticket-row').click();

        expect(testBed.get(MailboxTagsService).getActiveTagId).toHaveBeenCalledTimes(1);
        expect(testBed.get(Router).navigate).toHaveBeenCalledWith(['/mailbox/tickets/tag', 1, 'ticket', tickets[0].id]);

        //adds 'open' class if ticket has open tag
        expect(testBed.findAll('.ticket-row')[0].classList.contains('open')).toEqual(true);
        expect(testBed.findAll('.ticket-row')[1].classList.contains('open')).toEqual(false);

        //renders customer name
        expect(testBed.find('.ticket-row .customer-name').textContent.trim()).toEqual(tickets[0].user.display_name);

        //renders customer avatar
        expect(testBed.find('.ticket-row img')['src']).toContain(tickets[0].user['avatar']);

        //renders ticket tags (skips tag with type "status")
        let tags = testBed.find('.ticket-row').querySelectorAll('.tag-label');
        expect(tags.length).toEqual(1);
        expect(tags[0].textContent.trim()).toEqual(tickets[0]['tags'][1]['display_name']);

        //renders ticket subject
        expect(testBed.find('.ticket-row .ticket-subject').textContent.trim()).toEqual(tickets[0].subject);

        //renders ticket body
        expect(testBed.find('.ticket-row .ticket-body').textContent.trim()).toEqual(tickets[0].replies[0].body);

        //renders replies count
        expect(parseInt(testBed.find('.ticket-row .replies-count').textContent.trim())).toEqual(tickets[0]['replies_count']);

        //renders ticker number/ID
        expect(parseInt(testBed.find('.ticket-row .ticket-number').textContent.trim())).toEqual(tickets[0].id);

        //renders updated_at
        expect(testBed.find('.ticket-row .last-updated').textContent.trim()).toEqual(tickets[0]['updated_at_formatted']);
    });

    it('renders and binds tickets checkbox', () => {
        const tickets = testBed.fake('Ticket', 2);
        testBed.component.items = tickets;
        testBed.fixture.detectChanges();
        let checkbox = testBed.find('.ticket-row .checkbox input');

        //toggles ticket on checkbox click
        testBed.toggleCheckbox('.ticket-row .checkbox input');
        expect(testBed.component.selectedItems).toEqual([tickets[0].id]);
        testBed.toggleCheckbox('.ticket-row .checkbox input');
        expect(testBed.component.selectedItems).toEqual([]);

        //sets checkbox 'checked' state
        expect(checkbox['checked']).toEqual(false);
        testBed.component.selectedItems = [tickets[0].id];
        testBed.fixture.detectChanges();
        expect(checkbox['checked']).toEqual(true);
    });

    it('renders ticket floating toolbar', () => {
        const tickets = testBed.fake('Ticket', 2);
        testBed.fixture.detectChanges();
        spyOn(testBed.component.paginator, 'refresh');
        testBed.fixture.detectChanges();

        //hidden if there are no selected tickets
        expect(testBed.find('ticket-floating-toolbar').classList.contains('hidden')).toEqual(true);

        //visible if there are selected tickets
        testBed.component.selectedItems = [tickets[0].id];
        testBed.fixture.detectChanges();
        expect(testBed.find('ticket-floating-toolbar').classList.contains('hidden')).toEqual(false);

        //selected tickets are bind to floating toolbar
        testBed.component.selectedItems = [1, 2, 3];
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(TicketFloatingToolbarComponent).selectedTickets).toEqual([1, 2, 3]);

        //deselects tickets and refreshed paginator on floating toolbar "onTicketsUpdated" event
        testBed.component.selectedItems = [1, 2, 3];
        testBed.getChildComponent(TicketFloatingToolbarComponent).ticketsUpdated();
        expect(testBed.component.selectedItems).toEqual([]);
        expect(testBed.component.paginator.refresh).toHaveBeenCalledTimes(1);
    });

    it('renders pagination controls', () => {
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(PaginationControlsComponent).paginator).toBeTruthy();
        expect(testBed.getChildComponent(PaginationControlsComponent).itemsName).toEqual('Tickets');
    });

    it('renders loading indicator', () => {
        testBed.component.fetchTickets = false;
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(LoadingIndicatorComponent).isVisible).toEqual(false);
        testBed.component.paginator.isLoading = true;
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(LoadingIndicatorComponent).isVisible).toEqual(true);
    });
});