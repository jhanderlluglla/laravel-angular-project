import {KarmaTest} from "../../../../testing/karma-test";
import {TicketFloatingToolbarComponent} from "./ticket-floating-toolbar.component";
import {AssignTicketDropdownComponent} from "../assign-ticket-dropdown/assign-ticket-dropdown.component";
import {AddTagDropdownComponent} from "../add-tag-dropdown/add-tag-dropdown.component";
import {TicketsService} from "../tickets.service";
import {BehaviorSubject} from "rxjs";
import {MailboxTagsService} from "../mailbox-tags.service";
import {ToastService} from "../../shared/toast/toast.service";
import {TagService} from "../../shared/tag.service";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {CurrentUser} from "../../auth/current-user";

describe('TicketFloatingToolbar', () => {
    let testBed: KarmaTest<TicketFloatingToolbarComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    TicketFloatingToolbarComponent, AssignTicketDropdownComponent, AddTagDropdownComponent,
                ],
                providers: [TicketsService, MailboxTagsService, TagService],
            },
            component: TicketFloatingToolbarComponent
        });

        spyOn(testBed.get(CurrentUser), 'hasPermissions').and.returnValue(true);
    });

    it('deletes tickets', () => {
        spyOn(testBed.get(TicketsService), 'deleteMultiple').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.get(MailboxTagsService), 'refresh');
        spyOn(testBed.get(ToastService), 'show');

        let eventFired = false;
        testBed.component.onTicketsUpdated.subscribe(() => eventFired = true);

        testBed.component.deleteTickets([1, 2]);

        //call to backend was made to delete tickets
        expect(testBed.get(TicketsService).deleteMultiple).toHaveBeenCalledTimes(1);

        //tickets deselect event was fired
        expect(eventFired).toEqual(true);

        //mailbox tags were refreshed
        expect(testBed.get(MailboxTagsService).refresh).toHaveBeenCalledTimes(1);

        //toast was shown
        expect(testBed.get(ToastService).show).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('changes status of all selected tickets', () => {
        let tag = {name: 'foo'};
        testBed.component.selectedTickets = [1, 2, 3];
        spyOn(testBed.get(TicketsService), 'changeMultipleTicketsStatus').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.component.mailboxTags, 'refresh');

        testBed.component.setStatusForSelectedTickets(tag);

        //call was made to backend to change all selected tickets status
        expect(testBed.get(TicketsService).changeMultipleTicketsStatus).toHaveBeenCalledWith(testBed.component.selectedTickets, tag);

        //refreshes mailbox tags
        expect(testBed.component.mailboxTags.refresh).toHaveBeenCalledTimes(1);
    });

    it('asks user to confirm ticket deletion and deletes tickets if user confirms', () => {
        testBed.component.selectedTickets = [1, 2, 3];
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject({})});
        spyOn(testBed.component, 'deleteTickets');

        testBed.component.maybeDeleteSelectedTickets();

        //confirmation modal is shown
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ConfirmModalComponent, jasmine.any(Object));

        //tickets are deleted if user has confirmed deletion
        expect(testBed.component.deleteTickets).toHaveBeenCalledWith(testBed.component.selectedTickets);
    });

    it('renders assign ticket dropdown', () => {
        testBed.component.selectedTickets = [1, 2, 3];
        testBed.fixture.detectChanges();

        let dropdown = testBed.getChildComponent(AssignTicketDropdownComponent);

        //selected tickets are bound
        expect(dropdown.ticketsIds).toEqual(testBed.component.selectedTickets);

        //"onAssigned" event is bound properly
        spyOn(testBed.component, 'ticketsUpdated');
        dropdown.onAssigned.emit();
        expect(testBed.component.ticketsUpdated).toHaveBeenCalledTimes(1);
    });

    it('renders change status dropdown', () => {
        let tags = [{name: 'foo'}, {name: 'bar'}, {name: 'mine'}];
        testBed.get(MailboxTagsService).statusTags = tags as any;

        testBed.fixture.detectChanges();

        //status tags are rendered ("mine" tag is skipped)
        expect(testBed.findAll('.status-tag').length).toEqual(2);
        expect(testBed.find('.status-tag').textContent.trim()).toEqual(tags[0].name);

        //assigned status to selected tickets on tag click
        spyOn(testBed.component, 'setStatusForSelectedTickets');
        testBed.find('.status-tag').click();
        expect(testBed.component.setStatusForSelectedTickets).toHaveBeenCalledWith(tags[0]);
    });

    it('renders add tag dropdown', () => {
        testBed.component.selectedTickets = [1, 2, 3];
        testBed.fixture.detectChanges();

        let dropdown = testBed.getChildComponent(AddTagDropdownComponent);

        //selected tickets are bound
        expect(dropdown.ticketIds).toEqual(testBed.component.selectedTickets);

        //"onTagAdded' event is bound
        spyOn(testBed.component, 'ticketsUpdated');
        dropdown.onTagAdded.emit();
        expect(testBed.component.ticketsUpdated).toHaveBeenCalledTimes(1);
    });

    xit('renders delete tickets button', () => {
        spyOn(testBed.component, 'maybeDeleteSelectedTickets');
        testBed.find('.delete-tickets-button').click();
        expect(testBed.component.maybeDeleteSelectedTickets).toHaveBeenCalledTimes(1);
    });
});