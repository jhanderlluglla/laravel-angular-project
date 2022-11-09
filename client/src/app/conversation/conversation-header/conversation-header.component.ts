import {Component, ViewEncapsulation, Input} from "@angular/core";
import {CurrentUser} from "../../auth/current-user";
import {Conversation} from "../conversation.service";
import {Tag} from "../../shared/models/Tag";
import {TicketsService} from "../../ticketing/tickets.service";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";

@Component({
    selector: 'conversation-header',
    templateUrl: './conversation-header.component.html',
    styleUrls: ['./conversation-header.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ConversationHeaderComponent {

    /**
     * ConversationHeaderComponent Constructor.
     */
    constructor(
        private tickets: TicketsService,
        public currentUser: CurrentUser,
        private mailboxTags: MailboxTagsService,
        public conversation: Conversation,
    ) {}

    /**
     * Remove specified tag from current ticket.
     */
    public removeTag(tagToRemove: Tag) {
        this.tickets.removeTag(tagToRemove, [this.conversation.get().id]).subscribe(() => {
            this.conversation.get().tags = this.conversation.get().tags.filter(tag => tag.id != tagToRemove.id);
            this.mailboxTags.refresh();
        });
    }
}
