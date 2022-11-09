import {KarmaTest} from "../../../../testing/karma-test";
import {AssignTicketDropdownComponent} from "./assign-ticket-dropdown.component";
import {UserService} from "../../admin/users/user.service";
import {TicketsService} from "../tickets.service";
import {BehaviorSubject} from "rxjs";
import {MailboxTagsService} from "../mailbox-tags.service";

describe('AssignTicketDropdown', () => {
    let testBed: KarmaTest<any>;
    let ticket = {assigned_to: 1, id: 2};
    let tickets: TicketsService;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [AssignTicketDropdownComponent],
                providers: [UserService, TicketsService, MailboxTagsService],
            },
            component: AssignTicketDropdownComponent
        });

        testBed.logInAsAdmin();
        testBed.fixture.componentInstance.ticket = ticket;

        tickets = testBed.get(TicketsService);
        spyOn(tickets, 'assign').and.returnValue(new BehaviorSubject(true));
    });

    it('fetches available agents when dropdown is first opened and renders them', () => {
        let usersService = testBed.get(UserService); let agent = {email: 'test@test.com', id: 1};
        spyOn(usersService, 'getUsers').and.returnValue(new BehaviorSubject([agent, testBed.getCurrentUser()]));
        testBed.fixture.detectChanges();

        //open dropdown
        let dropdown = testBed.find('dropdown');
        dropdown.click();

        //assert that dropdown has been opened
        expect(dropdown.classList.contains('dropdown-open')).toEqual(true);

        //assert that agents were fetched properly
        expect(usersService.getUsers).toHaveBeenCalled();

        //assert that dropdown items were rendered properly
        testBed.fixture.detectChanges();
        expect(testBed.fixture.componentInstance.agents[0]).toEqual(agent);
        expect(testBed.findAll('.dropdown-item').length).toEqual(3);

        //assert that currently logged in user email is not rendered
        let emails = [];
        for (let i = 0; i < testBed.findAll('.dropdown-item').length; i++) {
            emails.push(testBed.findAll('.dropdown-item')[i].textContent);
        }
        expect(emails.indexOf(testBed.getCurrentUser()['email'])).toEqual(-1);

        //assert dropdown has been closed
        testBed.findAll('.dropdown-item')[0].click();
        expect(dropdown.classList.contains('dropdown-open')).toEqual(false);
    });

    it('correctly sends ticket ids to backend and fires "onAssigned" event', () => {
        //subscribe to onAssigned event
        let onAssignedFired = 0;
        testBed.fixture.componentInstance.onAssigned.subscribe(() => onAssignedFired += 1);

        //assert that ids are correctly sent if ticket is passed in via @Input
        testBed.fixture.componentInstance.assignTicketsTo();
        expect(tickets.assign).toHaveBeenCalledWith([ticket.id], null);

        //assert that 'assigned_to' property was unset from ticket, if ticket is passed in via @Input
        expect(ticket.assigned_to).toEqual(null);

        //assert that IDs are correctly sent if multiple ticket IDs is passed in via @Input
        testBed.fixture.componentInstance.ticketsIds = [1, 2];
        testBed.fixture.componentInstance.assignTicketsTo(1);
        expect(tickets.assign).toHaveBeenCalledWith([1, 2], 1);

        //assert that 'onAssigned' event was fired properly
        expect(onAssignedFired).toEqual(2);
    });

    it('unassigns ticket (assigns to anyone)', () => {
        //click first (anyone) dropdown item
        testBed.find('.anyone-item').click();

        //assert that correct call was made to backend
        expect(tickets.assign).toHaveBeenCalledWith([ticket.id], null);
    });

    it('assigns ticket to currently logged in user', () => {
        //click second (me) dropdown item
        testBed.find('.me-item').click();

        //assert that correct call was made to backend
        expect(tickets.assign).toHaveBeenCalledWith([ticket.id], testBed.getCurrentUser()['id']);
    });

    it('assigns ticket to agent whose email was clicked', () => {
        testBed.fixture.componentInstance.agents = [{id: 3}];
        testBed.fixture.detectChanges();

        //click third (actual agent email) dropdown item
        testBed.find('.agent-item').click();

        //assert that correct call was made to backend
        expect(tickets.assign).toHaveBeenCalledWith([ticket.id], 3);
    });

    it('adds "active" class to agent, ticket is currently assigned to', () => {
        //'anyone' should have 'active' class by default
        testBed.fixture.componentInstance.ticket = {};
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.dropdown-item')[0].classList.contains('active')).toEqual(true);

        //'me' should have 'active' class if ticket is assigned to currently logged in user
        testBed.fixture.componentInstance.ticket = {assigned_to: testBed.getCurrentUser().id};
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.dropdown-item')[1].classList.contains('active')).toEqual(true);

        //email ticket is assigned to should have 'active' class
        testBed.fixture.componentInstance.agents = [{id: 7}];
        testBed.fixture.componentInstance.ticket = {assigned_to: 7};
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.dropdown-item')[2].classList.contains('active')).toEqual(true);
    });
});