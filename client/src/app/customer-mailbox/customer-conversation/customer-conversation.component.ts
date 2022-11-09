import {Component, ViewEncapsulation} from '@angular/core';
import {CurrentUser} from "../../auth/current-user";
import {UploadsService} from "../../shared/uploads.service";
import {TicketAttachmentsService} from "../../ticketing/ticket-attachments.service";
import {ActivatedRoute} from "@angular/router";
import {Conversation} from "../../conversation/conversation.service";

@Component({
    selector: 'customer-conversation',
    templateUrl: './customer-conversation.component.html',
    styleUrls: ['./customer-conversation.component.scss'],
    providers: [TicketAttachmentsService],
    encapsulation: ViewEncapsulation.None,
})
export class CustomerConversationComponent {

    /**
     * CustomerConversationComponent Constructor.
     */
    constructor(
        private route: ActivatedRoute,
        public uploads: UploadsService,
        public currentUser: CurrentUser,
        public conversation: Conversation,
    ) {}

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.conversation.init(data.ticket);
        });
    }
}
