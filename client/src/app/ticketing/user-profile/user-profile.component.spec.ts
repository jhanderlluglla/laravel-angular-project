import {KarmaTest} from "../../../../testing/karma-test";
import {UserProfileComponent} from "./user-profile.component";
import {AgentNavbarComponent} from "../../shared/agent-navbar/agent-navbar.component";
import {TicketsListComponent} from "../tickets-list/tickets-list.component";
import {TagsManagerComponent} from "../../help-center/manage/tags-manager/tags-manager.component";
import {UserAccessManagerComponent} from "../../user/user-access-manager/user-access-manager.component";
import {PaginationControlsComponent} from "../../shared/pagination/pagination-controls/pagination-controls.component";
import {TicketSearchDropdownComponent} from "../../shared/ticket-search-dropdown/ticket-search-dropdown.component";
import {LoggedInUserWidgetComponent} from "../../shared/logged-in-user-widget/logged-in-user-widget.component";
import {HighlightOpenTicketDirective} from "../tickets-list/highlight-open-ticket-directive";
import {TicketFloatingToolbarComponent} from "../ticket-floating-toolbar/ticket-floating-toolbar.component";
import {LoadingIndicatorComponent} from "../../shared/loading-indicator/loading-indicator.component";
import {MapToIterable} from "../../shared/map-to-iterable";
import {AssignTicketDropdownComponent} from "../assign-ticket-dropdown/assign-ticket-dropdown.component";
import {AddTagDropdownComponent} from "../add-tag-dropdown/add-tag-dropdown.component";
import {GroupService} from "../../admin/groups/group.service";
import {UserService} from "../../admin/users/user.service";
import {TagService} from "../../shared/tag.service";
import {TicketsService} from "../tickets.service";
import {ActivatedRoute} from "@angular/router";
import {ActivatedRouteStub} from "../../../../testing/stubs/activated-route-stub";
import {User} from "../../shared/models/User";
import {fakeAsync, tick} from "@angular/core/testing";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ToastService} from "../../shared/toast/toast.service";
import { ModalService} from "../../shared/modal/modal.service";
import {EmailAddressModalComponent} from "../../user/email-address-modal/email-address-modal.component";
import {Email} from "../../shared/models/Email";
import {UploadsService} from "../../shared/uploads.service";
import {FileValidator} from "../../shared/file-validator";
import {NoResultsMessageComponent} from "../../shared/no-results-message/no-results-message.component";
import {MailboxTagsService} from "../mailbox-tags.service";
import {BackendEvents} from "../../shared/backend-events";
import {AuthService} from "../../auth/auth.service";
import {CurrentUser} from "../../auth/current-user";

describe('UserProfileComponent', () => {
    let testBed: KarmaTest<any>;
    let user: User;
    let emails: Email[];

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    UserProfileComponent, AgentNavbarComponent, TicketsListComponent, TagsManagerComponent, UserAccessManagerComponent,
                    PaginationControlsComponent, TicketSearchDropdownComponent, LoggedInUserWidgetComponent, HighlightOpenTicketDirective,
                    TicketFloatingToolbarComponent, LoadingIndicatorComponent, MapToIterable, AssignTicketDropdownComponent, AddTagDropdownComponent,
                    NoResultsMessageComponent,
                ],
                providers: [
                    GroupService, UserService, TagService, TicketsService, UploadsService, MailboxTagsService,
                    FileValidator, BackendEvents, AuthService, {provide: ActivatedRoute, useClass: ActivatedRouteStub}
                ],
            },
            component: UserProfileComponent,
        });

        testBed.get(MailboxTagsService).allTags = [testBed.fake('Tag', 1, {name: 'open'})];

        emails = testBed.fake('Email', 2);
        user = testBed.fake('User');
        user.secondary_emails = emails.slice();
        testBed.get(ActivatedRoute)['testData'] = {resolves: {user: user, tickets: {data: testBed.fake('Ticket', 2)}}};
    });

    it('hydrates user profile with data from route resolves', () => {
        spyOn(testBed.get(UserService), 'updateDetails');

        testBed.fixture.detectChanges();

        //hydrates user model
        expect(testBed.component.user).toEqual(user);

        //hydrates tag manager component
        expect(testBed.component.tagsManager.selectedTags).toEqual([user.tags[0].name, user.tags[1].name]);

        //hydrates user profile FormGroup
        expect(testBed.component.profile.controls.details.value).toEqual(user.details.details);
        expect(testBed.component.profile.controls.notes.value).toEqual(user.details.notes);

        //does not update profile when initial data is set
        expect(testBed.get(UserService).updateDetails).not.toHaveBeenCalled();
    });

    it('updates user profile on notes or details change', fakeAsync(() => {
        spyOn(testBed.get(UserService), 'updateDetails').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.get(ToastService), 'show');
        user.details = null;

        testBed.fixture.detectChanges();

        testBed.typeIntoEl('#details', 'foo');
        tick(601);

        testBed.typeIntoEl('#notes', 'bar');
        tick(601);

        expect(testBed.get(UserService).updateDetails).toHaveBeenCalledTimes(2);
        expect(testBed.get(ToastService).show).toHaveBeenCalledTimes(2);

        //saves profile on details change
        expect(testBed.get(UserService).updateDetails).toHaveBeenCalledWith(user.id, jasmine.objectContaining({details: 'foo'}));

        //saves profile on notes change
        expect(testBed.get(UserService).updateDetails).toHaveBeenCalledWith(user.id, jasmine.objectContaining({notes: 'bar'}));
    }));

    it('creates paginator from route data', () => {
        user.details = null;
        let tickets = [testBed.fake('Ticket')];
        testBed.get(ActivatedRoute)['testData'] = {resolves: {user, tickets: {total: 99, data: tickets}}};

        testBed.fixture.detectChanges();

        expect(testBed.component.paginator).toBeTruthy();
        expect(testBed.component.paginator.serverUri).toEqual('tickets');
        expect(testBed.component.paginator.params.total).toEqual(99);
        expect(testBed.component.paginator.data).toEqual(tickets);
    });

    it('opens add secondary email modal', () => {
        spyOn(testBed.get(CurrentUser), 'hasPermission').and.returnValue(true);
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject('foo@bar.com')});
        testBed.fixture.detectChanges();

        testBed.find('.add-email-button').click();

        //opens modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(EmailAddressModalComponent, {userId: user.id});

        //adds email specified via modal to user
        expect(user.secondary_emails).toContain(new Email({address: 'foo@bar.com'}));

        //pushes new email to user's secondary_emails array
        expect(testBed.component.user.secondary_emails).toContain(new Email({address: 'foo@bar.com'}));
    });

    it('removes secondary email from user', () => {
        spyOn(testBed.get(CurrentUser), 'hasPermission').and.returnValue(true);
        spyOn(testBed.get(UserService), 'removeEmail').and.returnValue(new BehaviorSubject({}));
        testBed.fixture.detectChanges();

        testBed.find('.remove-email-button').click();

        //calls server to remove secondary email
        expect(testBed.get(UserService).removeEmail).toHaveBeenCalledWith(user.id, {emails: [emails[0].address]});

        //removes email from user's secondary_emails array
        expect(testBed.component.user.secondary_emails).toEqual([emails[1]]);
    });

    it('uploads a new avatar for user', fakeAsync(() => {
        let updated = testBed.fake('User', 1, {avatar: 'foo.png'});
        spyOn(testBed.get(UploadsService), 'openUploadDialog').and.returnValue(new Promise(resolve => resolve('files')));
        spyOn(testBed.get(UserService), 'uploadAvatar').and.returnValue(new BehaviorSubject(updated));
        spyOn(testBed.get(ToastService), 'show');
        testBed.fixture.detectChanges();

        testBed.find('.upload-avatar-item').click();
        tick();

        //opens upload dialog
        expect(testBed.get(UploadsService).openUploadDialog).toHaveBeenCalledTimes(1);

        //uploads avatar
        expect(testBed.get(UserService).uploadAvatar).toHaveBeenCalledWith(user.id, 'files');

        //updates user model
        expect(testBed.component.user.avatar).toEqual(updated.avatar);

        //shows toast
        expect(testBed.get(ToastService).show).toHaveBeenCalledWith(jasmine.any(String));
    }));

    it('validates user avatar', fakeAsync(() => {
        spyOn(testBed.get(UploadsService), 'openUploadDialog').and.returnValue(new Promise(resolve => resolve('files')));
        spyOn(testBed.get(UploadsService), 'filesAreInvalid').and.returnValue(true);
        spyOn(testBed.get(UserService), 'uploadAvatar');
        testBed.fixture.detectChanges();

        testBed.find('.upload-avatar-item').click();
        tick();

        //opens upload dialog
        expect(testBed.get(UploadsService).openUploadDialog).toHaveBeenCalledTimes(1);

        //validates avatar
        expect(testBed.get(UploadsService).filesAreInvalid).toHaveBeenCalledTimes(1);

        //does not upload avatar
        expect(testBed.get(UserService).uploadAvatar).not.toHaveBeenCalled();
    }));

    it('deletes user avatar', () => {
        let updated = testBed.fake('User', 1, {avatar: 'foo.png'});
        spyOn(testBed.get(UserService), 'deleteAvatar').and.returnValue(new BehaviorSubject(updated));
        spyOn(testBed.get(ToastService), 'show');
        testBed.fixture.detectChanges();

        testBed.find('.delete-avatar-item').click();

        //deletes avatar
        expect(testBed.get(UserService).deleteAvatar).toHaveBeenCalledWith(user.id);

        //updates user model
        expect(testBed.component.user.avatar).toEqual(updated.avatar);

        //shows toast
        expect(testBed.get(ToastService).show).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('syncs user tags', () => {
        spyOn(testBed.get(UserService), 'syncTags').and.returnValue(new BehaviorSubject({}));
        testBed.fixture.detectChanges();

        testBed.getChildComponent(TagsManagerComponent).onChange.emit(['foo', 'bar']);

        expect(testBed.get(UserService).syncTags).toHaveBeenCalledWith(user.id, {tags: ['foo', 'bar']});
    });

    it('renders user profile', () => {
        testBed.fixture.detectChanges();

        //renders avatar
        expect(testBed.find('.user-avatar')['src']).toEqual(user.avatar);

        //renders primary email
        expect(testBed.find('.email').textContent.trim()).toEqual(user.email);

        //renders secondary emails
        expect(testBed.findAll('.secondary-email').length).toEqual(user.secondary_emails.length);
        expect(testBed.find('.secondary-email').textContent.trim()).toEqual(user.secondary_emails[0].address);

        //renders "UserAccessManager" component
        expect(testBed.getChildComponent(UserAccessManagerComponent).user).toEqual(user);

        //renders "TicketsList" component
        expect(testBed.getChildComponent(TicketsListComponent).openTicketInModal).toEqual(true);
        expect(testBed.getChildComponent(TicketsListComponent).fetchTickets).toEqual(false);
        expect(testBed.getChildComponent(TicketsListComponent).items).toEqual(testBed.component.paginator.data);

        //renders "PaginationControls" component
        let paginationControls = testBed.findAllDebugEl('pagination-controls')[1].componentInstance;
        expect(paginationControls.paginator).toBeTruthy();
        expect(paginationControls.defaultPerPage).toEqual('10');
        expect(paginationControls.itemsName).toEqual('Tickets');
    });
});