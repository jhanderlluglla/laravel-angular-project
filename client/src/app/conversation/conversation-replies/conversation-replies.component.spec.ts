import {KarmaTest} from "../../../../testing/karma-test";
import {ConversationRepliesComponent} from "./conversation-replies.component";
import {AttachmentsListComponent} from "../../shared/attachments-list/attachments-list.component";
import {Conversation} from "../conversation.service";
import {TrushHtmlPipe} from "../../shared/trust-html.pipe";
import {BehaviorSubject, Observable, Observer} from "rxjs";
import {ModalService} from "../../shared/modal/modal.service";
import {ToastService} from "../../shared/toast/toast.service";
import {ShowOriginalReplyModalComponent} from "./show-original-reply-modal/show-original-reply-modal.component";
import {TicketsService} from "../../ticketing/tickets.service";
import {UpdateReplyModalComponent} from "../../ticketing/update-reply-modal/update-reply-modal.component";
import {modelFactory} from "../../../../testing/model-factory";
import {BackendEvents} from "../../shared/backend-events";
import {ConfirmReplyDeleteModalComponent} from "../confirm-reply-delete-modal/confirm-reply-delete-modal.component";
import {Draft} from "../draft.service";
import {ConversationReplies} from "../conversation-replies.service";
import {AfterReplyAction} from "../after-reply-action.service";
import {TicketAttachmentsService} from "../../ticketing/ticket-attachments.service";
import {UploadsService} from "../../shared/uploads.service";
import {FileValidator} from "../../shared/file-validator";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";
import {Reply} from "../../shared/models/Reply";

describe('ConversationReplies', () => {
    let testBed: KarmaTest<ConversationRepliesComponent>;
    let basicDraft;
    let basicReply;
    let basicNote;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [ConversationRepliesComponent, AttachmentsListComponent, ShowOriginalReplyModalComponent, TrushHtmlPipe],
                providers: [
                    TicketsService, BackendEvents, Conversation, UploadsService, FileValidator,
                    Draft, ConversationReplies, AfterReplyAction, TicketAttachmentsService, MailboxTagsService,
                ],
            },
            component: ConversationRepliesComponent,
        });

        testBed.get(Conversation).init(testBed.fake('Ticket', 1, {tags: [testBed.fake('Tag', 1, {type: 'status'})]}));
        testBed.logInAsAdmin();

        basicDraft = testBed.fake('Reply', 1, {type: 'drafts', user_id: testBed.getCurrentUser().id});
        basicReply = testBed.fake('Reply', 1, {type: 'replies', user_id: testBed.getCurrentUser().id});
        basicNote = testBed.fake('Reply', 1, {type: 'notes', user_id: testBed.getCurrentUser().id});
    });

    it('inits the component', () => {
        //sets replies from currently active ticket on component instance
        testBed.fixture.detectChanges();
        expect(testBed.get(Conversation).replies.get()).toEqual(testBed.get(Conversation).replies.get());

        //does not add reply via backend events if reply does not belong to current ticket
        let reply1 = modelFactory.make('Reply', 1);
        testBed.get(BackendEvents).ticketReplyCreated.emit(reply1);
        expect(testBed.get(Conversation).replies.get()).not.toContain(reply1);

        //adds new reply via backend events
        let reply2 = modelFactory.make('Reply', 1, {ticket_id: testBed.get(Conversation).get().id});
        testBed.get(BackendEvents).ticketReplyCreated.emit(reply2);
        expect(testBed.get(Conversation).replies.get()).toContain(reply2);
        testBed.fixture.detectChanges();
        expect(testBed.find('.reply').classList.contains('bounce')).toBeTruthy();
    });

    it('fetches more replies from backend', () => {
        let response = {data: [basicReply, basicReply], current_page: 3, last_page: 4};
        let observer: Observer<any>;
        let observable = Observable.create(o => observer = o);
        spyOn(testBed.get(TicketsService), 'getReplies').and.returnValue(observable);
        testBed.get(Conversation).replies.init([basicDraft], testBed.get(Conversation).get().id);
        testBed.fixture.detectChanges();

        //assert it does not make call to backend if replies are already loading
        testBed.get(Conversation).replies.isLoading = true;
        testBed.get(Conversation).replies.loadMore();
        expect(testBed.get(TicketsService).getReplies).toHaveBeenCalledTimes(0);

       testBed.get(Conversation).replies.isLoading = false;
       testBed.get(Conversation).replies.loadMore();

        //assert "isLoading" was set to true
        expect(testBed.get(Conversation).replies.isLoading).toEqual(true);

        //complete backend call
        observer.next(response);

        //assert backend call was made with correct params
        expect(testBed.get(TicketsService).getReplies).toHaveBeenCalledWith(testBed.get(Conversation).get().id, 2);

        //assert replies were set properly (concat)
        expect(testBed.get(Conversation).replies.get()).toEqual([basicDraft, basicReply, basicReply]);

        //assert current page was set
        expect(testBed.get(Conversation).replies.currentPage).toEqual(response.current_page);

        //assert last page was set
        expect(testBed.get(Conversation).replies.lastPage).toEqual(response.last_page);

        //assert "isLoading" was set to false
        expect(testBed.get(Conversation).replies.isLoading).toEqual(false);
    });

    it('adds reply to replies array', () => {
        testBed.get(Conversation).replies.init([], 1);

        //assert it does not add reply if it has no ID
        testBed.get(Conversation).replies.add(new Reply());
        expect(testBed.get(Conversation).replies.get()).toEqual([]);

        //assert it does not add reply if it already exists
        testBed.get(Conversation).replies.init([basicReply], 1);
        testBed.get(Conversation).replies.add(basicReply);
        expect(testBed.get(Conversation).replies.get().length).toEqual(1);

        //assert it adds reply to the begging of array
        testBed.get(Conversation).replies.init([basicDraft], 1);
        testBed.get(Conversation).replies.add(basicReply);
        expect(testBed.get(Conversation).replies.get().length).toEqual(2);
        expect(testBed.get(Conversation).replies.get()[0]).toEqual(basicReply);
    });

    it('opens update reply modal', () => {
        testBed.logInAsAdmin();
        testBed.get(Conversation).replies.init([basicDraft, basicNote, basicReply], 1);

        let updatedReply = Object.assign({}, basicReply);
        updatedReply['body'] = 'updated body';
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject(updatedReply)});
        testBed.fixture.detectChanges();

        testBed.find('.update-reply-button').click();

        //opened modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(UpdateReplyModalComponent, {reply: jasmine.anything()});

        //updated reply
        expect(testBed.get(Conversation).replies.get()[0]).toEqual(basicDraft);
        expect(testBed.get(Conversation).replies.get()[1]).toEqual(basicNote);
        expect(testBed.get(Conversation).replies.get()[2]).toEqual(updatedReply);
    });

    it('removes reply from array', () => {
        testBed.get(Conversation).replies.init([basicNote, basicReply, basicDraft], 1);

        testBed.get(Conversation).replies.remove(basicReply.id);

        //assert reply was removed from replies array
        expect(testBed.get(Conversation).replies.get().length).toEqual(2);
        expect(testBed.get(Conversation).replies.get()).toEqual([basicNote, basicDraft]);
    });

    it('confirms reply deletion', () => {
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject({})});
        spyOn(testBed.get(Conversation).replies, 'delete');

        testBed.component.maybeDeleteReply(basicReply);

        //assert modal was opened
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ConfirmReplyDeleteModalComponent, {reply: jasmine.anything()});

        //assert reply was deleted if user confirmed
        expect(testBed.get(Conversation).replies.delete).toHaveBeenCalledWith(basicReply);
    });

    it('edits draft', () => {
        testBed.get(Conversation).setEditor({focus: () => {}, setContents: () => {}} as any);
        testBed.get(Conversation).replies.init([basicDraft, basicReply], 1);
        testBed.fixture.detectChanges();

        testBed.component.editDraft(basicDraft);

        //assert draft was set as active on conversation service
        expect(testBed.get(Conversation).draft.get()).toEqual(basicDraft);

        //opens text editor
        expect(testBed.get(Conversation).isEditorOpen()).toEqual(true);

        //assert it removes draft that is being editor from replies array
        expect(testBed.get(Conversation).replies.get()).toEqual([basicReply]);
    });

    it('deletes reply', () => {
        testBed.fixture.detectChanges();
        testBed.get(Conversation).replies.init([basicNote, basicReply, basicDraft], 1);
        spyOn(testBed.get(TicketsService), 'deleteReply').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.get(ToastService), 'show');

        testBed.get(Conversation).replies.delete(basicReply);

        //assert call to backend was made
        expect(testBed.get(TicketsService).deleteReply).toHaveBeenCalledWith(basicReply.id);

        //assert reply was removed from replies array
        expect(testBed.get(Conversation).replies.get().length).toEqual(2);
        expect(testBed.get(Conversation).replies.get()).toEqual([basicNote, basicDraft]);

        //assert success message was shown
        expect(testBed.get(ToastService).show).toHaveBeenCalledWith(jasmine.any(String))
    });

    it('confirms and deletes draft', () => {
        testBed.fixture.detectChanges();
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject({})});
        testBed.get(Conversation).replies.init([basicNote, basicReply, basicDraft], 1);
        spyOn(testBed.get(TicketsService), 'deleteDraft').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.get(TicketsService), 'deleteReply');
        spyOn(testBed.get(ToastService), 'show');

        testBed.component.maybeDeleteReply(basicDraft);

        //opens confirm modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ConfirmReplyDeleteModalComponent, {reply: jasmine.anything()});

        //deletes draft
        expect(testBed.get(TicketsService).deleteDraft).toHaveBeenCalledTimes(1);
        expect(testBed.get(TicketsService).deleteReply).not.toHaveBeenCalled();
    });

    it('shows original reply email', () => {
        testBed.fixture.detectChanges();
        testBed.logInAsAdmin();
        testBed.get(Conversation).replies.init([basicReply], 1);
        testBed.fixture.detectChanges();
        spyOn(testBed.get(TicketsService), 'getOriginalEmailForReply').and.returnValue(new BehaviorSubject({data: 'foo bar'}));
        spyOn(testBed.get(ModalService), 'show');

        testBed.find('.show-original-reply-button').click();

        //fetches original email from backend
        expect(testBed.get(TicketsService).getOriginalEmailForReply).toHaveBeenCalledWith(basicReply.id);

        //shows original email in modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ShowOriginalReplyModalComponent, {original: 'foo bar'});
    });

    it('renders if there are no replies', () => {
        testBed.fixture.detectChanges();
        testBed.get(Conversation).replies.init([], 1);
        testBed.fixture.detectChanges();
    });

    it('renders replies properly', () => {
        let replies = [basicDraft, testBed.fake('Reply', 1, {user_id: 123})];
        testBed.get(Conversation).replies.init(replies, 1);
        testBed.fixture.detectChanges();

        //assert main replies container is visible
        expect(testBed.find('.thread')).toBeTruthy();

        //assert both replies were rendered
        expect(testBed.findAll('.reply').length).toEqual(2);

        //assert it adds reply type as class on reply element
        expect(testBed.findAll('.reply')[0].classList.contains('drafts')).toEqual(true);
        expect(testBed.findAll('.reply')[1].classList.contains('reply')).toEqual(true);

        //assert it adds "my-reply" class if reply is by current user
        expect(testBed.findAll('.reply')[0].classList.contains('my-reply')).toEqual(true);
        expect(testBed.findAll('.reply')[1].classList.contains('my-reply')).toEqual(false);
    });

    it('renders reply header', () => {
        let reply = {body: 'foo', type: 'replies', user_id: testBed.getCurrentUser().id, user: {id: testBed.getCurrentUser().id}, uploads: []};
        testBed.get(Conversation).replies.init([reply, basicNote, basicDraft, basicReply], 1);
        testBed.fixture.detectChanges();

        let replies = testBed.findAll('.reply');

        //assert customer name is "You" if reply is by current user
        expect(replies[0].querySelector('.customer-name').textContent.trim()).toEqual('You');

        //assert customer name is "display_name" if reply is not current user
        reply.user.id = 123;
        reply.user['display_name'] = testBed.getCurrentUser().display_name;
        testBed.fixture.detectChanges();
        expect(replies[0].querySelector('.customer-name').textContent.trim()).toEqual(testBed.getCurrentUser().display_name);

        //assert there aren't any extra action text elements rendered
        expect(testBed.findAll('.action-text').length).toEqual(4);

        //assert it shows "replied" if it's NOT earliest reply of type "replies"
        expect(replies[0].querySelector('.action-text').textContent.trim()).toEqual('replied');

        //assert it shows "started the conversation" if it's earliest reply of type "replies"
        expect(replies[3].querySelector('.action-text').textContent.trim()).toEqual('started the conversation');

        //assert it shows "left a note" if reply is of type "note"
        expect(replies[1].querySelector('.action-text').textContent.trim()).toEqual('left a note');

        //assert it shows "created a draft" if reply is of type "drafts"
        expect(replies[2].querySelector('.action-text').textContent.trim()).toEqual('created a draft');

        //assert it renders actions buttons if reply is of type "drafts"
        expect(testBed.findAll('.draft-actions').length).toEqual(1);

        //assert draft action buttons are bound and rendered properly
        spyOn(testBed.component, 'editDraft');
        spyOn(testBed.component, 'maybeDeleteReply');

        testBed.find('.edit-draft-button').click();
        expect(testBed.component.editDraft).toHaveBeenCalledWith(basicDraft);

        testBed.find('.delete-draft-button').click();
        expect(testBed.component.maybeDeleteReply).toHaveBeenCalledWith(basicDraft);
    });

    it('renders reply meta', () => {
        let reply = Object.assign({}, basicReply);
        reply['created_at_formatted'] = 'foo date';
        testBed.get(Conversation).replies.init([reply], 1);
        testBed.fixture.detectChanges();

        //assert "created at" date was rendered
        expect(testBed.find('.meta .date').textContent.trim()).toEqual(reply['created_at_formatted']);

        //assert it hides reply actions menu if current user is not agent
        testBed.logOut();
        testBed.fixture.detectChanges();
        expect(testBed.find('.reply-actions')).toBeFalsy();

        testBed.logInAsAdmin();

        //hides reply actions if reply is of type "drafts"
        testBed.get(Conversation).replies.get()[0].type = 'drafts';
        testBed.fixture.detectChanges();
        expect(testBed.find('.reply-actions')).toBeFalsy();

        //assert reply actions menu is bound properly
        testBed.get(Conversation).replies.get()[0].type = 'replies';
        testBed.fixture.detectChanges();

        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject({})});
        spyOn(testBed.component, 'maybeDeleteReply');

        testBed.find('.update-reply-button').click();
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(UpdateReplyModalComponent, {reply: jasmine.anything()});

        testBed.find('.delete-reply-button').click();
        expect(testBed.component.maybeDeleteReply).toHaveBeenCalledWith(reply);
    });

    it('renders reply body and attachments', () => {
        let reply = Object.assign({}, basicReply);
        reply['body'] = '<div>foo bar</div>';
        reply['uploads'] = [{name: 'foo', mime: 'bar'}];
        testBed.get(Conversation).replies.init([reply], 1);
        testBed.fixture.detectChanges();

        //interprets html tags and renders the reply body text
        expect(testBed.find('.message-body').textContent.trim()).toEqual('foo bar');

        //assert attachments list is bound and rendered
        expect(testBed.getChildComponent(AttachmentsListComponent).attachments).toEqual(reply['uploads']);
    });
});