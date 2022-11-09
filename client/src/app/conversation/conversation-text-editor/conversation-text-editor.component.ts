import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {Conversation} from "../conversation.service";
import {CurrentUser} from "../../auth/current-user";
import {TextEditorComponent} from "../../text-editor/text-editor.component";
import {Reply} from "../../shared/models/Reply";
import {ModalService} from "../../shared/modal/modal.service";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";
import {Tag} from "../../shared/models/Tag";
import {ConfirmReplyDeleteModalComponent} from "../confirm-reply-delete-modal/confirm-reply-delete-modal.component";
import {BrowserEvents} from "../../shared/browser-events.service";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'conversation-text-editor',
    templateUrl: './conversation-text-editor.component.html',
    styleUrls: ['./conversation-text-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ConversationTextEditorComponent implements OnInit, OnDestroy {
    @ViewChild('textEditor') textEditor: TextEditorComponent;

    /**
     * Status that should be applied to ticket after submitting reply.
     */
    public selectedStatus = new Tag();

    /**
     * Active subscriptions for this components.
     */
    private subscriptions: Subscription[] = [];

    /**
     * ConversationTextEditorComponent constructor.
     */
    constructor(
        private modal: ModalService,
        public currentUser: CurrentUser,
        public conversation: Conversation,
        private browserEvents: BrowserEvents,
        public mailboxTags: MailboxTagsService,
    ) {}

    ngOnInit() {
        this.setSelectedStatus();
        this.initKeybinds();
        this.conversation.setEditor(this.textEditor);
    }

    /**
     * Submit reply for current conversation.
     */
    public submitReply() {
        const payload = {body: this.textEditor.getContents(), status: this.selectedStatus};

        this.conversation.submitReply(payload).subscribe(() => {
            this.closeEditor();
        });
    }

    /**
     * Save current draft.
     */
    public saveDraft(params = {}) {
        return this.conversation.draft.save(params);
    }

    /**
     * Close text editor.
     */
    public closeEditor() {
        this.conversation.closeEditor();
        this.conversation.draft.reset();
        this.textEditor.reset();
    }

    /**
     * Save draft, add it to conversation replies and close editor.
     */
    public saveDraftAndAddToReplies() {
        if ( ! this.conversation.draft.isEmpty()) {
            this.saveDraft().subscribe(response => {
                this.conversation.replies.add(response.data);
                this.closeEditor();
            });
        } else {
            this.closeEditor();
        }
    }

    /**
     * Ask user to confirm draft deletion and delete if user confirms.
     */
    public maybeDeleteDraft() {
        //TODO: refactor to use async/wait and remove duplicated stuff
        const draft = this.conversation.draft.get();

        if (draft.id) {
            this.modal.show(ConfirmReplyDeleteModalComponent, {reply: draft}).onDone.subscribe(() => {
                this.conversation.draft.delete();
                this.closeEditor();
            });
        } else {
            this.closeEditor();
        }
    }

    /**
     * Add specified canned reply to text editor.
     */
    public applyCannedReply(reply: Reply) {
        this.textEditor.insertContents(reply.body);

        setTimeout(() => {
            this.saveDraft({uploads: reply.uploads});
        });
    }

    /**
     * Set the status that should be applied to ticket after submitting reply.
     */
    private setSelectedStatus() {
        let tag: Tag;

        //if current user is customer open ticket when they reply,
        //otherwise set default tag to "closed"
        if ( ! this.currentUser.hasPermission('tickets.update')) {
            tag = this.mailboxTags.getTagByName('open');
        } else {
            tag = this.mailboxTags.getTagByName('closed');
        }

        this.selectedStatus = tag;
    }

    /**
     * Init keybinds for conversation text editor.
     */
    private initKeybinds() {
        let sub = this.browserEvents.globalKeyDown$.subscribe(e => {

            //if any modals are open or user is currently typing, bail
            if (this.modal.anyOpen() || BrowserEvents.userIsTyping()) return;

            //open text editor
            if (e.keyCode === this.browserEvents.keyCodes.letters.r) {
                this.conversation.openEditor();
            }
        });

        this.subscriptions.push(sub);
    }

    ngOnDestroy() {
        this.saveDraft();
        this.closeEditor();

        this.subscriptions.forEach(subscription => {
            subscription && subscription.unsubscribe();
        });
    }
}
