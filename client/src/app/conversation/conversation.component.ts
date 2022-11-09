import {Component, OnInit, Input, ViewEncapsulation} from '@angular/core';
import {CurrentUser} from "../auth/current-user";
import {UploadsService} from "../shared/uploads.service";
import {TicketAttachmentsService} from "../ticketing/ticket-attachments.service";
import {Conversation} from "./conversation.service";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'conversation',
    templateUrl: './conversation.component.html',
    styleUrls: ['./conversation.component.scss'],
    providers: [TicketAttachmentsService],
    encapsulation: ViewEncapsulation.None,
})
export class ConversationComponent implements OnInit {

    /**
     * If back button should be visible.
     */
    @Input() hideBackButton = false;

    /**
     * If conversation sidebar should be hidden.
     */
    @Input() hideSidebar = false;

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
