import {KarmaTest} from "../../../../testing/karma-test";
import {ConversationSidebarComponent} from "./conversation-sidebar.component";
import {Conversation} from "../conversation.service";
import {BehaviorSubject} from "rxjs";
import {ConversationModalComponent} from "../conversation-modal/conversation-modal.component";
import {HighlightOpenTicketDirective} from "../../ticketing/tickets-list/highlight-open-ticket-directive";
import {TicketsService} from "../../ticketing/tickets.service";
import {ModalService} from "../../shared/modal/modal.service";
import {Draft} from "../draft.service";
import {ConversationReplies} from "../conversation-replies.service";
import {AfterReplyAction} from "../after-reply-action.service";
import {TicketAttachmentsService} from "../../ticketing/ticket-attachments.service";
import {FileValidator} from "../../shared/file-validator";
import {UploadsService} from "../../shared/uploads.service";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";

describe('ConversationSidebarComponent', () => {
    let testBed: KarmaTest<ConversationSidebarComponent>;
    let user;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [ConversationSidebarComponent, HighlightOpenTicketDirective],
                providers: [
                    TicketAttachmentsService, FileValidator, UploadsService, MailboxTagsService,
                    TicketsService, Conversation, Draft, ConversationReplies, AfterReplyAction
                ],
            },
            component: ConversationSidebarComponent,
        });

        user = testBed.fake('User');
        testBed.get(Conversation).init(testBed.fake('Ticket', 1, {tags: [testBed.fake('Tag', 1, {type: 'status'})], user}));
    });

    it('renders sidebar', () => {
        testBed.fixture.detectChanges();

        //assert it renders requester avatar
        expect(testBed.find('.avatar > img')['src']).toContain(user.avatar);

        //assert it renders requester display name
        expect(testBed.find('.name').textContent.trim()).toEqual(user.display_name);

        //assert it renders requester email
        expect(testBed.find('.email').textContent).toContain(user.email);

        //assert it's not rendered if requester is not set on component
        testBed.component.requester = null;
        testBed.fixture.detectChanges();
        expect(testBed.find('.user-info')).toBeFalsy();
    });

    it('toggles tickets list visibility', () => {
        testBed.fixture.detectChanges();

        //assert list is visible by default
        expect(testBed.component.previousTicketsVisible).toEqual(true);
        expect(testBed.find('.tickets-list-container').classList.contains('tickets-visible')).toEqual(true);

        //assert list is hidden on toggle button click
        testBed.find('.title').click(); testBed.fixture.detectChanges();
        expect(testBed.component.previousTicketsVisible).toEqual(false);
        expect(testBed.find('.tickets-list-container').classList.contains('tickets-visible')).toEqual(false);

        //assert list is visible on toggle subsequent button click
        testBed.find('.title').click(); testBed.fixture.detectChanges();
        expect(testBed.component.previousTicketsVisible).toEqual(true);
        expect(testBed.find('.tickets-list-container').classList.contains('tickets-visible')).toEqual(true);
    });

    it('renders tickets list', () => {
        testBed.fixture.detectChanges();

        //assert list is hidden if there are no tickets
        expect(testBed.find('.tickets-list')).toBeFalsy();

        //assert tickets are rendered properly
        testBed.component.otherTickets = [
            testBed.fake('Ticket', 1, {tags: [testBed.fake('Tag', 1, {name: 'open'})]}),
            testBed.fake('Ticket', 1, {tags: [testBed.fake('Tag', 1, {name: 'closed'})]}),
        ];
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.ticket').length).toEqual(2);
        expect(testBed.find('.ticket').textContent.trim()).toEqual(testBed.component.otherTickets[0].subject);

        //it adds "open" class to currently open tickets
        expect(testBed.findAll('.ticket')[0].classList.contains('open')).toEqual(true);
        expect(testBed.findAll('.ticket')[1].classList.contains('open')).toEqual(false);

        //assert it opens ticket model on subject click
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onClose: new BehaviorSubject(false)});
        testBed.find('.ticket').click();
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(
            ConversationModalComponent,
            {ticketId: testBed.component.otherTickets[0].id, activeTicketId: testBed.get(Conversation).get().id}
        );
    });

    it('fetches all current requester tickets', () => {
        //mock backend call
        let tickets = testBed.fake('Ticket', 2);
        tickets.push(testBed.fake('Ticket', 1, {id: testBed.get(Conversation).get().id}));
        spyOn(testBed.get(TicketsService), 'getTickets').and.returnValue(new BehaviorSubject({data: tickets}));

        testBed.fixture.detectChanges();

        //assert backend call was made
        expect(testBed.get(TicketsService).getTickets).toHaveBeenCalledWith({user_id: user.id, per_page: jasmine.any(Number)});

        //assert all tickets except currently active one were set on component instance;
        expect(testBed.component.otherTickets).toEqual([tickets[0], tickets[1]]);
    });
});