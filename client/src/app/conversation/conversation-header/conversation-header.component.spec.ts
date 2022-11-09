import {ConversationHeaderComponent} from "./conversation-header.component";
import {BehaviorSubject} from "rxjs";
import {Conversation} from "../conversation.service";
import {KarmaTest} from "../../../../testing/karma-test";
import {ActivatedRoute} from "@angular/router";
import {CurrentUser} from "../../auth/current-user";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";
import {TicketsService} from "../../ticketing/tickets.service";
import {Tag} from "../../shared/models/Tag";
import {Draft} from "../draft.service";
import {ConversationReplies} from "../conversation-replies.service";
import {AfterReplyAction} from "../after-reply-action.service";
import {TicketAttachmentsService} from "../../ticketing/ticket-attachments.service";
import {UploadsService} from "../../shared/uploads.service";
import {FileValidator} from "../../shared/file-validator";

describe('ConversationHeader', () => {
    let testBed: KarmaTest<any>;
    let tags: Tag[];

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [ConversationHeaderComponent],
                providers: [
                    MailboxTagsService, TicketsService, Conversation, UploadsService, FileValidator,
                    Draft, ConversationReplies, AfterReplyAction, TicketAttachmentsService,
                ],
            },
            component: ConversationHeaderComponent
        });

        tags = [testBed.fake('Tag'), testBed.fake('Tag'), testBed.fake('Tag', 1, {type: 'status'})];
        testBed.get(Conversation).init(testBed.fake('Ticket', 1, {tags}));
        testBed.get(ActivatedRoute)['testData'] = {conversation: testBed.get(Conversation)};
    });

    it('renders ticket subject', () => {
        testBed.fixture.detectChanges();
        expect(testBed.find('.ticket-subject').textContent).toEqual(testBed.get(Conversation).get().subject);
    });

    it('renders ticket tags', () => {
        testBed.get(Conversation).get().tags = tags;
        testBed.fixture.detectChanges();

        let tagsList = testBed.findAll('.tags > .tag-label');

        //assert it skips tags with type of "status" and renders other two tags
        expect(tagsList.length).toEqual(2);

        //assert tag name was rendered properly
        expect(tagsList[0].querySelector('.tag-name').textContent).toEqual(testBed.get(Conversation).get().tags[0].name);

        //assert remove tag button is hidden if current user does not have correct permissions
        expect(tagsList[0].querySelector('.remove-tag-button')).toBeFalsy();
    });

    it('removes tag from ticket', () => {
        spyOn(testBed.get(CurrentUser), 'hasPermission').and.returnValue(true);
        testBed.get(Conversation).get().tags = tags;
        testBed.fixture.detectChanges();

        spyOn(testBed.get(TicketsService), 'removeTag').and.returnValue(new BehaviorSubject(true));
        spyOn(testBed.get(MailboxTagsService), 'refresh');

        //click remove tag button on first ticket tag
        testBed.find('.remove-tag-button').click();

        //assert call was made to backend to remove clicked tag
        expect(testBed.get(TicketsService).removeTag).toHaveBeenCalledWith(tags[0], [testBed.get(Conversation).get().id]);

        //assert mailbox tags were refreshed
        expect(testBed.get(MailboxTagsService).refresh).toHaveBeenCalled();

        //assert tag was removed from component instance and converstion service
        expect(testBed.get(Conversation).get().tags).toEqual(tags.slice(1));

        //assert tag was removed from template
        expect(testBed.findAll('.tags > .tag-label').length).toEqual(2);
    });

    it('renders ticket meta information', () => {
        testBed.get(Conversation).get()['created_at_formatted'] = 'foo';
        testBed.get(Conversation).get()['created_at_month'] = 'bar';
        testBed.fixture.detectChanges();

        expect(testBed.find('.ticket-created-at-date').textContent.replace(' ', '')).toEqual('foo(bar)');
    });

    it('opens ticket reply text editor', () => {
        testBed.find('.reply-button').click();

        //assert that text editor was opened
        expect(testBed.get(Conversation).isEditorOpen()).toEqual(true);
    });
});