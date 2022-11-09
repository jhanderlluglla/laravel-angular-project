import {ConversationComponent} from "./conversation.component";
import {ConversationRepliesComponent} from "./conversation-replies/conversation-replies.component";
import {ConversationHeaderComponent} from "./conversation-header/conversation-header.component";
import {ConversationToolbarComponent} from "./conversation-toolbar/conversation-toolbar.component";
import {ConversationTextEditorComponent} from "./conversation-text-editor/conversation-text-editor.component";
import {Conversation} from "./conversation.service";
import {ConversationSidebarComponent} from "./conversation-sidebar/conversation-sidebar.component";
import {ActivatedRoute} from "@angular/router";
import {KarmaTest} from "../../../testing/karma-test";
import {LoadingIndicatorComponent} from "../shared/loading-indicator/loading-indicator.component";
import {InfiniteScrollDirective} from "../shared/infinite-scroll/infinite-scroll.directive";
import {AttachmentsListComponent} from "../shared/attachments-list/attachments-list.component";
import {AddTagDropdownComponent} from "../ticketing/add-tag-dropdown/add-tag-dropdown.component";
import {AssignTicketDropdownComponent} from "../ticketing/assign-ticket-dropdown/assign-ticket-dropdown.component";
import {UploadProgressBar} from "../shared/upload-progress-bar/upload-progress-bar.component";
import {CannedRepliesDropdownComponent} from "../ticketing/canned-replies/dropdown/canned-replies-dropdown.component";
import {TextEditorComponent} from "../text-editor/text-editor.component";
import {HighlightOpenTicketDirective} from "../ticketing/tickets-list/highlight-open-ticket-directive";
import {TicketsService} from "../ticketing/tickets.service";
import {MailboxTagsService} from "../ticketing/mailbox-tags.service";
import {UploadsService} from "../shared/uploads.service";
import {FileValidator} from "../shared/file-validator";
import {CannedRepliesService} from "../ticketing/canned-replies/canned-replies.service";
import {ActivatedRouteStub} from "../../../testing/stubs/activated-route-stub";
import {By} from "@angular/platform-browser";
import {RouterHistory} from "../shared/router-history.service";
import {BackendEvents} from "../shared/backend-events";
import {Draft} from "./draft.service";
import {ConversationReplies} from "./conversation-replies.service";
import {AfterReplyAction} from "./after-reply-action.service";
import {TicketAttachmentsService} from "../ticketing/ticket-attachments.service";

describe('ConversationComponent', () => {
    let testBed: KarmaTest<ConversationComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    ConversationComponent, ConversationRepliesComponent, ConversationHeaderComponent, ConversationToolbarComponent, ConversationTextEditorComponent,
                    ConversationSidebarComponent, LoadingIndicatorComponent, InfiniteScrollDirective, AttachmentsListComponent, AddTagDropdownComponent, AssignTicketDropdownComponent,
                    UploadProgressBar, CannedRepliesDropdownComponent, TextEditorComponent, HighlightOpenTicketDirective
                ],
                providers: [
                    TicketsService, Conversation, MailboxTagsService, UploadsService, FileValidator, CannedRepliesService,
                    RouterHistory, BackendEvents, {provide: ActivatedRoute, useClass: ActivatedRouteStub},
                    Draft, ConversationReplies, AfterReplyAction, TicketAttachmentsService,
                ],
            },
            component: ConversationComponent,
        });

        testBed.get(ActivatedRoute)['testData'] = {ticket: testBed.fake('Ticket', 1, {tags: [testBed.fake('Tag', 1, {type: 'status'})]})};
    });

    it('renders conversation toolbar', () => {
        //assert it hides back button
        testBed.component.hideBackButton = true;
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(ConversationToolbarComponent).hideBackButton).toEqual(true);

        //assert it shows back button
        testBed.component.hideBackButton = false;
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(ConversationToolbarComponent).hideBackButton).toEqual(false);
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

    it('renders conversation header, text editor and replies components', () => {
        testBed.fixture.detectChanges();

        expect(testBed.getChildComponent(ConversationHeaderComponent)).toBeTruthy();
        expect(testBed.getChildComponent(ConversationTextEditorComponent)).toBeTruthy();
        expect(testBed.getChildComponent(ConversationRepliesComponent)).toBeTruthy();

        //assert conversation sidebar is hidden
        testBed.component.hideSidebar = true;
        testBed.fixture.detectChanges();
        expect(testBed.fixture.debugElement.query(By.directive(ConversationSidebarComponent))).toBeFalsy();

        //assert conversation sidebar is shown
        testBed.component.hideSidebar = false;
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(ConversationSidebarComponent)).toBeTruthy();
    });
});