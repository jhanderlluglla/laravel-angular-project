import {BehaviorSubject} from "rxjs";
import {Conversation} from "../conversation.service";
import {TagService} from "../../shared/tag.service";
import {KarmaTest} from "../../../../testing/karma-test";
import {UserService} from "../../admin/users/user.service";
import {AttachmentsListComponent} from "../../shared/attachments-list/attachments-list.component";
import {UploadProgressBar} from "../../shared/upload-progress-bar/upload-progress-bar.component";
import {async} from "@angular/core/testing";
import {ConversationToolbarComponent} from "./conversation-toolbar.component";
import {ModalService} from "../../shared/modal/modal.service";
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {AssignTicketDropdownComponent} from "../../ticketing/assign-ticket-dropdown/assign-ticket-dropdown.component";
import {AddTagDropdownComponent} from "../../ticketing/add-tag-dropdown/add-tag-dropdown.component";
import {AddNoteModalComponent} from "../../ticketing/add-note-modal/add-note-modal.component";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";
import {TicketsService} from "../../ticketing/tickets.service";
import {RouterHistory} from "../../shared/router-history.service";
import {Draft} from "../draft.service";
import {ConversationReplies} from "../conversation-replies.service";
import {AfterReplyAction} from "../after-reply-action.service";
import {TicketAttachmentsService} from "../../ticketing/ticket-attachments.service";
import {UploadsService} from "../../shared/uploads.service";
import {FileValidator} from "../../shared/file-validator";

describe('ConversationToolbar', () => {
    let testBed: KarmaTest<ConversationToolbarComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [ConversationToolbarComponent, AssignTicketDropdownComponent, AddTagDropdownComponent, AddNoteModalComponent, TextEditorComponent, AttachmentsListComponent, UploadProgressBar],
                providers: [
                    MailboxTagsService, TicketsService, Conversation, TagService, FileValidator, UserService, RouterHistory,
                    Draft, ConversationReplies, AfterReplyAction, TicketAttachmentsService, UploadsService
                ],
            },
            component: ConversationToolbarComponent
        });

        testBed.logInAsAdmin();

        testBed.get(Conversation).init(testBed.fake('Ticket', 1, {tags: [testBed.fake('Tag', 1, {type: 'status'})]}));
        testBed.get(MailboxTagsService).statusTags = testBed.fake('Tag', 3);
        testBed.get(MailboxTagsService).statusTags.push(testBed.fake('Tag', 1, {name: 'mine'}));
    });

    it('should open ticket status dropdown when ticket status button is clicked', () => {
        testBed.fixture.detectChanges();
        testBed.find('.ticket-status-dropdown-container').click();
        expect(testBed.find('.ticket-status-dropdown-container').classList.contains('dropdown-open')).toEqual(true);
    });

    it('should render available ticket status tags as ticket status dropdown items', () => {
        testBed.fixture.detectChanges();

        //it renders available tags
        expect(testBed.findAll('.ticket-status-dropdown-container .dropdown-item').length).toEqual(3);

        //it does not render 'mine' tag
        let names = [];
        testBed.findAll('.ticket-status-dropdown-container .dropdown-item').forEach(el => names.push(el.textContent.trim()));
        expect(names).not.toContain('mine');
    });

    it('should change active ticket status when status dropdown item is clicked', () => {
        spyOn(testBed.get(TicketsService), 'changeTicketStatus').and.returnValue(new BehaviorSubject(true));
        spyOn(testBed.get(MailboxTagsService), 'refresh');
        testBed.fixture.detectChanges();

        //open ticket status dropdown
        testBed.find('.ticket-status-dropdown-container').click();

        //click on first ticket status dropdown item
        testBed.find('.ticket-status-dropdown-container .dropdown-item').click();

        //changes ticket status
        expect(testBed.get(TicketsService).changeTicketStatus).toHaveBeenCalledWith(
            testBed.get(Conversation).get().id,
            testBed.get(MailboxTagsService).statusTags[0].name
        );

        //refreshes mailbox tags
        expect(testBed.get(MailboxTagsService).refresh).toHaveBeenCalledTimes(1);

        //closes ticket status dropdown
        expect(testBed.find('.ticket-status-dropdown-container').classList.contains('dropdown-open')).toEqual(false);
    });

    it('renders "AssignTicketDropdownComponent" properly', () => {
        testBed.fixture.detectChanges();
        //assert that ticket ID has been passed to 'AssignTicketDropdownComponent' properly
        expect(testBed.getChildComponent(AssignTicketDropdownComponent).ticket).toEqual(testBed.get(Conversation).get());
    });

    it('opens "add note" modal', async(() => {
        const note = testBed.fake('Reply');
        const ticket = testBed.get(Conversation).get();
        testBed.fixture.detectChanges();

        //mock modal service and replies component calls
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject(note)});

        //click add note button
        testBed.find('.add-note-button').click();

        //opens add note modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(AddNoteModalComponent, {ticketId: ticket.id});

        //adds newly created not to replies service
        expect(testBed.get(Conversation).replies.get()).toEqual([note, ticket.replies[0]]);
    }));

    it('renders "AddTagDropdownComponent" properly', () => {
        testBed.fixture.detectChanges();

        let tags = testBed.fake('Tag', 2);
        testBed.get(Conversation).get().tags = [tags[0]];

        //assert that ticket ID has been passed to 'AddTagDropdownComponent' properly
        expect(testBed.getChildComponent(AddTagDropdownComponent).ticketIds).toEqual([testBed.get(Conversation).get().id]);

        //assert that tag is added properly on "onTagAdded" event from "AddTagDropdownComponent"
        testBed.getChildComponent(AddTagDropdownComponent).onTagAdded.emit(tags[1]);

        expect(testBed.get(Conversation).get().tags).toEqual([tags[1], tags[0]]);
    });

    it('renders active ticket ID properly', () => {
        testBed.fixture.detectChanges();
        expect(testBed.find('.ticket-number').textContent.trim()).toEqual('#'+testBed.get(Conversation).get().id);
    });
});