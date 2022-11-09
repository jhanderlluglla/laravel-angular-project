import {EventEmitter, Injectable} from '@angular/core';
import {Draft} from "./draft.service";
import {Ticket} from "../shared/models/Ticket";
import {ConversationReplies} from "./conversation-replies.service";
import {Tag} from "../shared/models/Tag";
import {TicketsService} from "../ticketing/tickets.service";
import {ToastService} from "../shared/toast/toast.service";
import {AfterReplyAction} from "./after-reply-action.service";
import {TextEditorComponent} from "../text-editor/text-editor.component";
import {Reply} from "../shared/models/Reply";
import {Priority} from "../shared/models/Priority";
import {Observable} from "rxjs/Observable";

@Injectable()
export class 
Conversation {

    /**
     * Whether conversation is loading currently.
     */
    public isLoading = false;

    /**
     * Ticket this conversation was created for.
     */
    private model = new Ticket();

    /**
     * Current status of the ticket (on the server).
     */
    private status = new Tag();

    /**
     * Current priority of the ticket (on the server).
     */
    private priority = new Priority();

    /**
     * Whether conversation reply is being saved currently.
     */
    public replySaving = false;

    /**
     * Whether text editor is currently open.
     */
    private editorIsOpen = false;

    /**
     * Instance of text editor for this conversation.
     */
    private editor: TextEditorComponent;

    /**
     * Fired after conversation is initiated or reloaded.
     */
    public afterInit = new EventEmitter();

    /**
     * Conversation service constructor.
     */
    constructor(
        public draft: Draft,
        private toast: ToastService,
        private tickets: TicketsService,
        public replies: ConversationReplies,
        public afterReplyAction: AfterReplyAction,
    ) {}

    /**
     * Get currently active ticket.
     */
    public get(): Ticket {
        return this.model;
    }

    /**
     * Get conversation status.
     */
    public getStatus() {
        return this.status;
    }

    /**
     * Get conversation status.
     */
    public getPriority() {
        if (this.priority)
            return this.priority;
        else return {
            name: 'Low'
        }
    }

    /**
     * Set conversation status.
     */
    public setStatus(tag?: Tag) {
        if ( ! tag) return;
        this.status = tag;
    }

    /**
     * Open conversation text editor.
     */
    public openEditor(isReply = false) {
        this.editorIsOpen = true;
        this.editor && this.editor.focus(isReply);
    }

    /**
     * Close conversation text editor.
     */
    public closeEditor() {
        this.editorIsOpen = false;
    }

    /**
     * Check if conversation text editor is open.
     */
    public isEditorOpen() {
        return this.editorIsOpen;
    }

    /**
     * Set text editor instance on conversation.
     */
    public setEditor(editor: TextEditorComponent) {
        this.editor = editor;
    }

    /**
     * Set specified draft as active.
     */
    public setDraft(draft: Reply) {
        this.draft.set(draft);
        this.editor.setContents(draft.body);
    }

    /**
     * Add specified tag to currently active ticket.
     */
    public addTag(newTag: Tag) {
        const exists = this.model.tags.find(tag => newTag.name === tag.name);
        if ( ! exists) this.model.tags.unshift(newTag);
    }

    /**
     * Submit a reply for current conversation.
     */
    public submitReply(params: {status?: Tag, body?: string} = {}): Observable<{data: Ticket}> {
        this.replySaving = true;

        const request = this.tickets.saveReply(this.model.id, this.draft.getPayload(params)).share();

        request.subscribe(response => {
            this.replySaving = false;

            this.draft.delete();
            this.performAfterReplyAction();
            this.setStatus(params.status);
            this.replies.add(response.data);
        }, () => {
            this.toast.show('There was an issue submitting this reply.');
            this.replySaving = false;
            this.isLoading = false;
        });

        return request;
    }

    /**
     * Perform after reply action and
     * mark conversation as "reloading"
     */
    public performAfterReplyAction() {
        if (this.afterReplyAction.get()) {
            this.isLoading = true;
        }

        this.afterReplyAction.perform();
    }

    /**
     * Init or reset conversation.
     */
    public init(ticket: Ticket) {
        if ( ! ticket) return;

        this.model = ticket;
        this.status = ticket.tags.find(tag => tag.type === 'status');
        this.priority = ticket.priority;
        this.replies.init(this.model.replies, this.model.id);
        this.draft.setTicketId(this.model.id);
        this.afterReplyAction.setTicketId(this.model.id);
        this.isLoading = false;
        this.afterInit.emit();
    }
}