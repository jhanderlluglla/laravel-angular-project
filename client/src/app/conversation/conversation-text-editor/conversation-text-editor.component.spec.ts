import {Conversation} from "../conversation.service";
import {KarmaTest} from "../../../../testing/karma-test";
import {AttachmentsListComponent} from "../../shared/attachments-list/attachments-list.component";
import {UploadProgressBar} from "../../shared/upload-progress-bar/upload-progress-bar.component";
import {ConversationTextEditorComponent} from "./conversation-text-editor.component";
import {UploadsService} from "../../shared/uploads.service";
import {utils} from "../../shared/utils";
import {SettingsService} from "../../shared/settings.service";
import {FileValidator} from "../../shared/file-validator";
import {fakeAsync, tick} from "@angular/core/testing";
import {BehaviorSubject} from "rxjs";
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {ModalService} from "../../shared/modal/modal.service";
import {Router, ActivatedRoute} from "@angular/router";
import {ActivatedRouteStub} from "../../../../testing/stubs/activated-route-stub";
import {CannedRepliesDropdownComponent} from "../../ticketing/canned-replies/dropdown/canned-replies-dropdown.component";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";
import {TicketsService} from "../../ticketing/tickets.service";
import {TicketAttachmentsService} from "../../ticketing/ticket-attachments.service";
import {CannedRepliesService} from "../../ticketing/canned-replies/canned-replies.service";
import {CrupdateCannedReplyModalComponent} from "../../ticketing/canned-replies/crupdate-canned-reply-modal/crupdate-canned-reply-modal.component";
import {Draft} from "../draft.service";
import {ConversationReplies} from "../conversation-replies.service";
import {AfterReplyAction} from "../after-reply-action.service";
import {Reply} from "../../shared/models/Reply";
import {Ticket} from "../../shared/models/Ticket";
import {ConfirmReplyDeleteModalComponent} from "../confirm-reply-delete-modal/confirm-reply-delete-modal.component";

describe('ConversationTextEditor', () => {
    let testBed: KarmaTest<ConversationTextEditorComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    ConversationTextEditorComponent, TextEditorComponent, AttachmentsListComponent, UploadProgressBar,
                    CrupdateCannedReplyModalComponent, CannedRepliesDropdownComponent
                ],
                providers: [
                    MailboxTagsService, TicketsService, Conversation, UploadsService, utils, SettingsService, FileValidator,
                    TicketAttachmentsService, CannedRepliesService, {provide: ActivatedRoute, useClass: ActivatedRouteStub},
                    Draft, ConversationReplies, AfterReplyAction,
                ],
            },
            component: ConversationTextEditorComponent,
        });
    });

    it('closes text editor', fakeAsync(() => {
        testBed.fixture.detectChanges();
        testBed.get(Conversation).openEditor();
        testBed.component.textEditor.setContents('foo');
        testBed.fixture.detectChanges();

        //opens text editor
        expect(testBed.find('.text-editor-container').classList.contains('hidden')).toEqual(false);
        expect(testBed.component.textEditor.getContents()).toEqual('foo');

        testBed.component.closeEditor();
        testBed.fixture.detectChanges();

        //closes text editor
        expect(testBed.get(Conversation).isEditorOpen()).toEqual(false);
        expect(testBed.find('.text-editor-container').classList.contains('hidden')).toEqual(true);

        //clears text editor contents
        expect(testBed.component.textEditor.getContents()).toEqual('');
    }));

    it('sets draft body on text editor content change', () => {
        testBed.fixture.detectChanges();
        testBed.component.textEditor.onChange.emit('foo');

        //sets draft body
        expect(testBed.get(Conversation).draft.get().body).toEqual('foo');
    });


    it('uploads and attaches files to ticket', fakeAsync(() => {
        const newUploads = testBed.fake('Upload', 2),
              oldUploads = testBed.fake('Upload', 2);

        testBed.fixture.detectChanges();
        testBed.get(Conversation).draft.set(new Reply({body: 'foo', uploads: oldUploads}));
        spyOn(testBed.get(UploadsService), 'filesAreInvalid').and.returnValue(false);
        spyOn(testBed.get(UploadsService), 'uploadFiles').and.returnValue(new BehaviorSubject({data: newUploads}));
        spyOn(testBed.get(Conversation).draft, 'save');

        //upload files
        let files = [{name: 'foo'}, {name: 'bar'}];
        testBed.component.textEditor.onFileUpload.emit(files);

        //validates uploaded files
        expect(testBed.get(UploadsService).filesAreInvalid).toHaveBeenCalledWith(files, true);

        //uploads files to backend
        expect(testBed.get(UploadsService).uploadFiles).toHaveBeenCalledWith(files);

        //adds uploads to draft
        expect(testBed.get(Conversation).draft.get().uploads).toEqual(oldUploads.concat(newUploads));

        //saves draft
        expect(testBed.get(Conversation).draft.save).toHaveBeenCalledTimes(1);
    }));

    it('renders attachments list component', () => {
        spyOn(testBed.get(Conversation).draft, 'detachUpload');
        const uploads = testBed.fake('Upload', 2);
        testBed.get(Conversation).draft.set(new Reply({uploads}));
        testBed.fixture.detectChanges();

        let attachmentsList = testBed.getChildComponent(AttachmentsListComponent);

        //binds draft attachments to attachments list
        expect(attachmentsList.attachments).toEqual(uploads);

        //detaches attachment from draft
        attachmentsList.removeAttachment(uploads[0].id);
        expect(testBed.get(Conversation).draft.detachUpload).toHaveBeenCalledWith(uploads[0].id);
    });

    it('hides canned reply button and dropdown if user does not have permissions', () => {
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(CannedRepliesDropdownComponent)).toBeFalsy();
    });

    it('applies canned reply to current draft', fakeAsync(() => {
        testBed.logInAsAdmin();
        testBed.component.textEditor.setContents('foo');
        spyOn(testBed.get(MailboxTagsService), 'getTagByName').and.returnValue(testBed.fake('Tag'));
        testBed.fixture.detectChanges();
        spyOn(testBed.get(Conversation).draft, 'save');
        const cannedReply = testBed.fake('Reply', 1, {uploads: testBed.fake('Upload', 2)});

        //fire "onReplySelected" event on canned replies dropdown
        testBed.getChildComponent(CannedRepliesDropdownComponent).onReplySelect.emit(cannedReply);
        tick();

        //inserts canned reply into text editor
        expect(testBed.component.textEditor.getContents()).toEqual('foo'+cannedReply.body);

        //appends canned reply to draft body
        expect(testBed.get(Conversation).draft.get().body).toEqual('foo'+cannedReply.body);

        //saves draft
        expect(testBed.get(Conversation).draft.save).toHaveBeenCalledWith({uploads: cannedReply.uploads});
    }));


    it('saves draft when user clicks on "save draft" button', fakeAsync(() => {
        testBed.fixture.detectChanges();
        testBed.get(Conversation).openEditor();
        const draft = testBed.fake('Reply');
        testBed.get(Conversation).draft.set(draft);
        spyOn(testBed.get(Conversation).draft, 'save').and.returnValue(draft);
        testBed.fixture.detectChanges();

        //click save draft button
        testBed.find('.save-draft-button').click();

        //saves draft
        expect(testBed.get(Conversation).draft.save).toHaveBeenCalledTimes(1);

        //closes text editor
        tick();
        expect(testBed.get(Conversation).isEditorOpen()).toEqual(false);

        //adds draft to conversation replies
        expect(testBed.get(Conversation).replies.get()).toEqual([draft]);
    }));

    it('asks user to confirm draft deletion and deletes draft if user confirms', fakeAsync(() => {
        testBed.fixture.detectChanges();
        testBed.get(Conversation).openEditor();
        const draft = testBed.fake('Reply');
        testBed.get(Conversation).draft.set(draft);
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject(true)});
        spyOn(testBed.get(TicketsService), 'deleteDraft').and.returnValue(new BehaviorSubject({}));
        testBed.fixture.detectChanges();

        testBed.find('.delete-draft-button').click();

        //opens confirm modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ConfirmReplyDeleteModalComponent, {reply: draft});

        //deletes draft after user confirms
        expect(testBed.get(TicketsService).deleteDraft).toHaveBeenCalledTimes(1);

        //resets draft service
        expect(testBed.get(Conversation).draft.get().id).toBeFalsy();

        //closes editor
        expect(testBed.get(Conversation).isEditorOpen()).toEqual(false);
    }));

    it('deletes draft without confirmation if draft is empty', () => {
        testBed.fixture.detectChanges();
        testBed.get(Conversation).openEditor();
        testBed.get(Conversation).draft.reset();
        testBed.fixture.detectChanges();

        spyOn(testBed.get(ModalService), 'show');
        spyOn(testBed.get(Conversation).draft, 'delete');

        testBed.component.maybeDeleteDraft();

        //does not open confirm modal or calls backend
        expect(testBed.get(ModalService).show).not.toHaveBeenCalled();
        expect(testBed.get(Conversation).draft.delete).not.toHaveBeenCalled();

        //closes editor
        expect(testBed.get(Conversation).isEditorOpen()).toEqual(false);
    });

    it('sets "selectedStatus" on component instance', () => {
        const tag = testBed.fake('Tag', 1, {name: 'open'});

        testBed.get(MailboxTagsService).setTags([tag]);
        testBed.fixture.detectChanges();

        //assert first status tag was selected
        expect(testBed.component.selectedStatus).toEqual(tag);
    });

    it('submits reply', fakeAsync(() => {
        const status = testBed.fake('Tag', 1, {name: 'open'});
        const draft = testBed.fake('Reply', 1, {uploads: testBed.fake('Upload', 2)});
        const ticket = testBed.fake('Ticket', 1, {tags: testBed.fake('Tag', 2)});
        const backendReply = testBed.fake('Reply');
        testBed.component.textEditor.setContents('foo contents');
        testBed.get(Conversation).openEditor();
        testBed.get(MailboxTagsService).setTags([status]);
        testBed.get(Conversation).draft.set(draft);
        testBed.get(Conversation).init(ticket);
        testBed.fixture.detectChanges();

        spyOn(testBed.get(TicketsService), 'saveReply').and.returnValue(new BehaviorSubject({data: backendReply}));

        testBed.component.submitReply();

        //saves reply to backend
        expect(testBed.get(TicketsService).saveReply).toHaveBeenCalledWith(
            testBed.get(Conversation).get().id,
            {
                body: testBed.component.textEditor.getContents(),
                status: status,
                uploads: draft.uploads.map(upload => upload.file_name)
            }
        );

        //adds reply to replies service
        expect(testBed.get(Conversation).replies.get()).toEqual([backendReply, ticket.replies[0]]);

        //closes text editor
        //expect(testBed.get(Conversation).isEditorOpen()).toEqual(false);

        //resets draft
        expect(testBed.get(Conversation).draft.isEmpty()).toEqual(true);

        //sets selected status on conversation
        expect(testBed.get(Conversation).getStatus()).toEqual(status);
    }));

    it('disables submit button when creating reply', () => {
        testBed.get(MailboxTagsService).setTags([testBed.fake('Tag', 1, {name: 'open'})]);
        testBed.fixture.detectChanges();

        spyOn(testBed.component, 'submitReply');

        //submit button is not disabled
        expect(testBed.find('.submit-button').hasAttribute('disabled')).toEqual(false);

        testBed.find('.submit-button').click();

        //calls submit method
        expect(testBed.component.submitReply).toHaveBeenCalledTimes(1);

        testBed.get(Conversation).replySaving = true;
        testBed.fixture.detectChanges();

        //disabled submit button
        expect(testBed.find('.submit-button').hasAttribute('disabled')).toEqual(true);
    });

    it('redirects user to next active ticket after submitting reply', () => {
        const ticket = {id: 1};
        spyOn(testBed.get(SettingsService), 'save').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.get(TicketsService), 'getLatestActiveTicket').and.returnValue(new BehaviorSubject(ticket));
        spyOn(testBed.get(Router), 'navigate');
        testBed.get(Conversation).afterReplyAction.set('next_active_ticket');
        testBed.get(MailboxTagsService).activeTag = testBed.fake('Tag');

        testBed.get(Conversation).afterReplyAction.perform();

        //assert next active ticket was fetched from backend
        expect(testBed.get(TicketsService).getLatestActiveTicket).toHaveBeenCalledWith(testBed.get(MailboxTagsService).activeTag.id);

        //assert user was redirected to next active ticket
        expect(testBed.get(Router).navigate).toHaveBeenCalledWith([ '/mailbox/tickets/tag/', testBed.get(MailboxTagsService).activeTag.id, 'ticket', 1]);
    });

    it('redirects user back to folder route if there are no more active tickets left for active tag', () => {
        spyOn(testBed.get(SettingsService), 'save').and.returnValue(new BehaviorSubject({}));
        testBed.get(Conversation).afterReplyAction.set('next_active_ticket');
        spyOn(testBed.get(TicketsService), 'getLatestActiveTicket').and.returnValue(new BehaviorSubject(null));
        spyOn(testBed.get(Router), 'navigate');

        testBed.get(Conversation).afterReplyAction.perform();

        //assert next active ticket was fetched from backend
        expect(testBed.get(TicketsService).getLatestActiveTicket).toHaveBeenCalledTimes(1);

        //redirects to tickets list
        expect(testBed.get(Router).navigate).toHaveBeenCalledWith(['/mailbox/tickets/tag/' + testBed.get(MailboxTagsService).getActiveTagId()]);
    });


    it('redirects user back to folder route after submitting reply', () => {
        spyOn(testBed.get(SettingsService), 'save').and.returnValue(new BehaviorSubject({}));
        testBed.get(Conversation).afterReplyAction.set('back_to_folder');
        spyOn(testBed.get(Router), 'navigate');

        testBed.get(Conversation).afterReplyAction.perform();

        //redirects to tickets list
        expect(testBed.get(Router).navigate).toHaveBeenCalledWith(['/mailbox/tickets/tag/' + testBed.get(MailboxTagsService).getActiveTagId()]);
    });

    it('stays on the same page if invalid command is passed to "performAfterReplyRedirect"', () => {
        spyOn(testBed.get(SettingsService), 'save').and.returnValue(new BehaviorSubject({}));
        testBed.get(Conversation).afterReplyAction.set('foo');
        spyOn(testBed.get(TicketsService), 'getLatestActiveTicket');
        spyOn(testBed.get(Router), 'navigate');

        testBed.get(Conversation).afterReplyAction.perform();

        //does not perform any after reply action
        expect(testBed.get(Router).navigate).toHaveBeenCalledTimes(0);
        expect(testBed.get(TicketsService).getLatestActiveTicket).toHaveBeenCalledTimes(0);
    });
});