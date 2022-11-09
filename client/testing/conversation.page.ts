import {ComponentFixture} from "@angular/core/testing";
import {Conversation} from "../src/app/ticketing/conversation/conversation.service";
import {MailboxTagsService} from "../src/app/ticketing/mailbox-tags.service";
import {TicketsService} from "../src/app/ticketing/tickets.service";
import {By} from "@angular/platform-browser";
import {Tag} from "../src/app/shared/models/Tag";

export class ConversationPage {

    /**
     * Conversation service instance.
     */
    public conversation: Conversation;

    /**
     * MailboxTags service (stub) instance.
     */
    public mailboxTags: MailboxTagsService;

    /**
     * Specified component fixture.
     */
    public fixture: ComponentFixture;

    /**
     * TicketsService instance.
     */
    public ticketsService: TicketsService;

    constructor(fixture: ComponentFixture<any>) {
        this.conversation = fixture.debugElement.injector.get(Conversation);
        this.mailboxTags = fixture.debugElement.injector.get(MailboxTagsService);
        this.ticketsService = fixture.debugElement.injector.get(TicketsService);
        this.fixture = fixture;
    }

    /**
     * Set status of currently active ticket.
     */
    public setActiveTicketStatus(tag: Tag) {
        this.conversation.status = tag;
    }

    /**
     * Set mock ticket as currently active ticket for conversation.
     */
    public mockActiveTicket() {
        this.setActiveTicketStatus('open');
        this.conversation.get() = {id: 1, subject: 'foo bar'};
        this.conversation.activeDraft = {model: {body: '', attachments: []}, isDirty: false};
        this.mailboxTags.statusTags = [this.getFirstStatusTagObject(), {name: 'closed'}, {name: 'pending'}];
        this.fixture.detectChanges();

        //spy on MailboxTagsService
        spyOn(this.fixture.debugElement.injector.get(MailboxTagsService), 'refresh');
    }

    /**
     * Get mocked status tag object for first ticket status dropdown item.
     */
    public getFirstStatusTagObject() {
        return {name: 'open'};
    }
}