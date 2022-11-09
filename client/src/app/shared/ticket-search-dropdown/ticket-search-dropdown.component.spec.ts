import {KarmaTest} from "../../../../testing/karma-test";
import {TicketSearchDropdownComponent} from "./ticket-search-dropdown.component";
import {TicketsService} from "../../ticketing/tickets.service";
import {Observer, Observable} from "rxjs";
import {fakeAsync, tick} from "@angular/core/testing";
import {Router} from "@angular/router";

describe('TicketSearchDropdown', () => {

    let testBed: KarmaTest<any>;

    let results = {
        tickets: {data: [
            {subject: 'foo', id: 1, latest_reply: {body: 'foo body'}, user: {id: 3, display_name: 'john doe'}},
            {subject: 'bar', id: 2, latest_reply: {}}
        ], total: 2},
        users: {data: [
            {email: 'foo@bar.com', display_name: 'john doe', avatar: 'foo_url', id: 4},
            {email: 'baz@bar.com', display_name: 'jane doe', avatar: 'bar_url', id: 5},
        ], total: 2}
    };

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    TicketSearchDropdownComponent
                ],
                providers: [TicketsService],
            },
            component: TicketSearchDropdownComponent
        });
    });

    it('sets default variables', () => {
        expect(testBed.component.searchQuery).toBeTruthy();
        expect(testBed.component.activeCategory).toEqual('tickets');
        expect(testBed.component.hasResults).toEqual(false);
        expect(testBed.component.loadedResultsAtLeastOnce).toEqual(false);
        expect(testBed.component.isLoading).toEqual(false);
        expect(testBed.component.results).toEqual(jasmine.any(Object));
    });

    it('searches for tickets and users', () => {
        let observer: Observer<any>;
        let observable = Observable.create(o => observer = o);
        spyOn(testBed.get(TicketsService), 'search').and.returnValue(observable);
        testBed.fixture.detectChanges();

        testBed.component.search('foo');

        //"isLoading" was set to true
        expect(testBed.component.isLoading).toEqual(true);

        //complete backend call
        observer.next({data: results});

        //search call to backend was made
        expect(testBed.get(TicketsService).search).toHaveBeenCalledWith('foo');

        //"hasResults" was set to true
        expect(testBed.component.hasResults).toBeTruthy();

        //"loadedResultsAtLeastOnce" was set to true
        expect(testBed.component.loadedResultsAtLeastOnce).toEqual(true);

        //results were set on component instance
        expect(testBed.component.results).toEqual(results);

        //"isLoading" was set to false
        expect(testBed.component.isLoading).toEqual(false);
    });

    it('searches via input element', fakeAsync(() => {
        testBed.fixture.detectChanges();
        let query = 'foo bar';
        spyOn(testBed.component, 'search');

        testBed.typeIntoEl('.search-input', query);
        tick(401);

        expect(testBed.component.search).toHaveBeenCalledWith(query);
    }));

    it('toggles "results" and "no-results" containers', () => {
        testBed.component.results = {tickets: [], users: []};

        //showns results container if there are search results
        testBed.component.loadedResultsAtLeastOnce = true;
        testBed.component.hasResults = true;
        testBed.fixture.detectChanges();
        expect(testBed.find('.results-container')).toBeTruthy();
        expect(testBed.find('.no-results')).toBeFalsy();

        //hides no results container if input has no value
        testBed.component.loadedResultsAtLeastOnce = true;
        testBed.component.hasResults = false;
        testBed.fixture.detectChanges();
        expect(testBed.find('.results-container')).toBeFalsy();
        expect(testBed.find('.no-results')).toBeFalsy();

        //shows no results container if all variables match
        testBed.component.loadedResultsAtLeastOnce = true;
        testBed.component.hasResults = false;
        testBed.component.searchQuery.setValue('foo bar');
        testBed.fixture.detectChanges();
        expect(testBed.find('.results-container')).toBeFalsy();
        expect(testBed.find('.no-results')).toBeTruthy();

        //renders no results container
        expect(testBed.find('.no-results').textContent).toBeTruthy();

        //hides both containers if there are no results and results have not been loaded yet
        testBed.component.loadedResultsAtLeastOnce = false;
        testBed.fixture.detectChanges();
        expect(testBed.find('.results-container')).toBeFalsy();
        expect(testBed.find('.no-results')).toBeFalsy();
    });

    it('toggles tickets and users tabs', () => {
        testBed.component.loadedResultsAtLeastOnce = true;
        testBed.component.hasResults = true;
        testBed.component.results = {tickets: [], users: []};
        testBed.fixture.detectChanges();

        //hides buttons if there are no tickets or users
        expect(testBed.findAll('.header-item').length).toEqual(0);

        testBed.component.results = results;
        testBed.component.dropdown.open();
        testBed.fixture.detectChanges();

        //sets active category and adds "active" class to currently active category
        testBed.findAll('.header-item')[0].click();
        testBed.fixture.detectChanges();
        expect(testBed.component.activeCategory).toEqual('tickets');
        expect(testBed.findAll('.header-item')[0].classList.contains('active')).toEqual(true);
        expect(testBed.findAll('.header-item')[1].classList.contains('active')).toEqual(false);
        expect(testBed.find('dropdown').classList.contains('dropdown-open')).toEqual(true);

        testBed.findAll('.header-item')[1].click();
        testBed.fixture.detectChanges();
        expect(testBed.component.activeCategory).toEqual('users');
        expect(testBed.findAll('.header-item')[0].classList.contains('active')).toEqual(false);
        expect(testBed.findAll('.header-item')[1].classList.contains('active')).toEqual(true);
        expect(testBed.find('dropdown').classList.contains('dropdown-open')).toEqual(true);
    });

    it('renders tickets results panel', () => {
        testBed.component.loadedResultsAtLeastOnce = true;
        testBed.component.hasResults = true;
        testBed.component.results = Object.assign({}, results);
        testBed.component.setActiveCategory('users');
        testBed.fixture.detectChanges();

        //hides tickets panel if active category is not "tickets"
        expect(testBed.find('.tickets-panel')).toBeFalsy();

        testBed.component.setActiveCategory('tickets');
        testBed.fixture.detectChanges();

        let tickets = testBed.findAll('.tickets-panel .result');

        //renders both tickets
        expect(tickets.length).toEqual(2);

        //opens tickets route when clicking on ticket
        spyOn(testBed.get(Router), 'navigate');
        tickets[0].click();
        expect(testBed.get(Router).navigate).toHaveBeenCalledWith(['/mailbox/tickets', 'tag', 1, 'ticket', results.tickets.data[0].id]);

        //renders ticket subject
        expect(tickets[0].querySelector('.title').textContent).toEqual(results.tickets.data[0].subject);

        //renders ticket body
        expect(tickets[0].querySelector('.body').textContent).toEqual(results.tickets.data[0].latest_reply['body']);

        //renders tickets creator display name and link
        expect(tickets[0].querySelector('.user').textContent.trim()).toEqual(results.tickets.data[0]['user']['display_name']);
    });

    it('renders users results panel', () => {
        testBed.component.loadedResultsAtLeastOnce = true;
        testBed.component.hasResults = true;
        testBed.component.results = Object.assign({}, results);
        testBed.component.setActiveCategory('tickets');
        testBed.fixture.detectChanges();

        //hides users panel if active category is not "users"
        expect(testBed.find('.users-panel')).toBeFalsy();

        testBed.component.setActiveCategory('users');
        testBed.fixture.detectChanges();

        let users = testBed.findAll('.users-panel .result');

        //renders both users
        expect(users.length).toEqual(2);

        //opens user route when clicking on ticket
        spyOn(testBed.get(Router), 'navigate');
        users[0].click();
        expect(testBed.get(Router).navigate).toHaveBeenCalledWith(['/mailbox/users', results.users.data[0].id]);

        //renders users avatar
        expect(users[0].querySelector('.avatar')['src']).toContain(results.users.data[0].avatar);

        //renders user email
        expect(users[0].querySelector('.title').textContent.trim()).toEqual(results.users.data[0].email);

        //renders user display name
        expect(users[0].querySelector('.body').textContent.trim()).toEqual(results.users.data[0].display_name);
    });

    it('renders "view more" button', () => {
        spyOn(testBed.component, 'openSearchModal');
        testBed.component.loadedResultsAtLeastOnce = true;
        testBed.component.hasResults = true;
        testBed.component.searchQuery.setValue('foo_bar');
        testBed.component.results = Object.assign({}, results);
        testBed.component.setActiveCategory('tickets');
        testBed.fixture.detectChanges();

        //opens search modal on click
        testBed.find('.footer').click();
        expect(testBed.component.openSearchModal).toHaveBeenCalledTimes(1);

        //hides footer if there is no search query
        testBed.component.searchQuery.setValue(null);
        testBed.fixture.detectChanges();
        expect(testBed.find('.footer')).toBeFalsy();
    });
});