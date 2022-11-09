import {KarmaTest} from "../../../../testing/karma-test";
import {ConversationHeaderComponent} from "../../conversation/conversation-header/conversation-header.component";
import {ConversationRepliesComponent} from "../../conversation/conversation-replies/conversation-replies.component";
import {ConversationTextEditorComponent} from "../../conversation/conversation-text-editor/conversation-text-editor.component";
import {TicketAttachmentsService} from "../../ticketing/ticket-attachments.service";
import {CustomerConversationComponent} from "./customer-conversation.component";
import {LoadingIndicatorComponent} from "../../shared/loading-indicator/loading-indicator.component";
import {AttachmentsListComponent} from "../../shared/attachments-list/attachments-list.component";
import {UploadProgressBar} from "../../shared/upload-progress-bar/upload-progress-bar.component";
import {CannedRepliesDropdownComponent} from "../../ticketing/canned-replies/dropdown/canned-replies-dropdown.component";
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {UploadsService} from "../../shared/uploads.service";
import {FileValidator} from "../../shared/file-validator";
import {TicketsService} from "../../ticketing/tickets.service";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";
import {InfiniteScrollDirective} from "../../shared/infinite-scroll/infinite-scroll.directive";
import {ActivatedRoute} from "@angular/router";
import {Conversation} from "../../conversation/conversation.service";
import {BackendEvents} from "../../shared/backend-events";
import {Draft} from "../../conversation/draft.service";
import {ConversationReplies} from "../../conversation/conversation-replies.service";
import {AfterReplyAction} from "../../conversation/after-reply-action.service";

describe('CustomerConversationComponent', () => {
    let testBed: KarmaTest<CustomerConversationComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    CustomerConversationComponent, ConversationHeaderComponent, ConversationRepliesComponent, ConversationTextEditorComponent,
                    LoadingIndicatorComponent, AttachmentsListComponent, UploadProgressBar, CannedRepliesDropdownComponent,
                    TextEditorComponent,
                ],
                providers: [
                    TicketAttachmentsService, UploadsService, FileValidator, TicketsService,
                    MailboxTagsService, Conversation, BackendEvents, Draft, ConversationReplies, AfterReplyAction,
                ],
            },
            component: CustomerConversationComponent
        });

        testBed.get(ActivatedRoute)['testData'] = {ticket: testBed.fake('Ticket', 1, {tags: [testBed.fake('Tag', 1, {type: 'status'})]})};
    });

    it('loads more replies from backend via infinite scroll', () => {
        testBed.fixture.detectChanges();

        //assert it loads more replies when "onInfiniteScroll" event is fired
        spyOn(testBed.get(Conversation).replies, 'loadMore');
        testBed.getChildComponent(InfiniteScrollDirective).onInfiniteScroll.emit();
        expect(testBed.get(Conversation).replies.loadMore).toHaveBeenCalledTimes(1);

        //assert it disables infinite scroll if there are no more replies left
        testBed.get(Conversation).replies.currentPage = 1;
        testBed.get(Conversation).replies.lastPage = 1;
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(InfiniteScrollDirective).infiniteScrollEnabled).toEqual(false);

        //assert it enables infinite scroll if there are more replies left
        testBed.get(Conversation).replies.currentPage = 1;
        testBed.get(Conversation).replies.lastPage = 2;
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(InfiniteScrollDirective).infiniteScrollEnabled).toEqual(true);
    });

    it('renders conversation header component', () => {
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(ConversationHeaderComponent)).toBeTruthy();
    });

    it('renders conversation text editor component', () => {
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(ConversationTextEditorComponent)).toBeTruthy();
    });

    it('renders conversation replies component', () => {
        testBed.fixture.detectChanges();

        //renders component
        expect(testBed.getChildComponent(ConversationRepliesComponent)).toBeTruthy();
    });

    it('renders loading indicator component', () => {
        testBed.get(Conversation).isLoading = true;

        testBed.fixture.detectChanges();

        expect(testBed.getChildComponent(LoadingIndicatorComponent)).toBeTruthy();
        expect(testBed.getChildComponent(LoadingIndicatorComponent).isVisible).toEqual(true);
    });
});