import {Component, OnInit, ViewEncapsulation, Input, AfterViewInit} from "@angular/core";
import {CurrentUser} from "../../auth/current-user";
import {ModalService} from "../../shared/modal/modal.service";
import {Conversation} from "../conversation.service";
import {ConversationTextEditorComponent} from "../conversation-text-editor/conversation-text-editor.component";
import {ShowOriginalReplyModalComponent} from "./show-original-reply-modal/show-original-reply-modal.component";
import {Reply} from "../../shared/models/Reply";
import {TicketsService} from "../../ticketing/tickets.service";
import {UpdateReplyModalComponent} from "../../ticketing/update-reply-modal/update-reply-modal.component";
import prismjs from 'prismjs';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-typescript';
import {BackendEvents} from "../../shared/backend-events";
import {ConfirmReplyDeleteModalComponent} from "../confirm-reply-delete-modal/confirm-reply-delete-modal.component";

@Component({
    selector: 'conversation-replies',
    templateUrl: './conversation-replies.component.html',
    styleUrls: ['./conversation-replies.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ConversationRepliesComponent implements OnInit, AfterViewInit {
    @Input() textEditor: ConversationTextEditorComponent;

    /**
     * ConversationReplies Constructor.
     */
    constructor(
        private modal: ModalService,
        public currentUser: CurrentUser,
        private tickets: TicketsService,
        public conversation: Conversation,
        private backendEvents: BackendEvents,
    ) {}

    ngOnInit() {
        //make sure only replies to this ticket are added via backend events
        this.backendEvents.ticketReplyCreated.subscribe((reply: Reply) => {
            if (this.conversation.get().id !== reply.ticket_id) return;
            reply['animated'] = true;
            this.conversation.replies.add(reply);
        });
    }

    ngAfterViewInit() {
        prismjs && prismjs.highlightAll();
    }

    /**
     * Update existing reply.
     */
    public update(reply: Reply) {
        this.modal.show(UpdateReplyModalComponent, {reply}).onDone.subscribe((reply: Reply) => {
            this.conversation.replies.replace(reply);
        });
    }

    /**
     * Delete specified reply if user confirms this action.
     */
    public maybeDeleteReply(reply: Reply) {
        this.modal.show(ConfirmReplyDeleteModalComponent, {reply}).onDone.subscribe(() => {
            this.conversation.replies.delete(reply);
        });
    }

    /**
     * Open specified draft in text editor.
     */
    public editDraft(draft: Reply) {
        this.conversation.setDraft(draft);
        this.conversation.openEditor();
        this.conversation.replies.remove(draft.id);
    }

    /**
     * Show original email that this reply was created from.
     * (if it was created from email)
     */
    public showOriginalEmail(reply: Reply) {
        this.tickets.getOriginalEmailForReply(reply.id).subscribe(response => {
            this.modal.show(ShowOriginalReplyModalComponent, {original: response.data});
        }, () => {
            this.modal.show(ShowOriginalReplyModalComponent);
        });
    }
}
