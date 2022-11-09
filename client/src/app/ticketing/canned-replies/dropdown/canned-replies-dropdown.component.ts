import {Component, Input, OnInit, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ModalService} from "../../../shared/modal/modal.service";
import {Reply} from "../../../shared/models/Reply";
import {Conversation} from "../../../conversation/conversation.service";
import {CannedRepliesService} from "../canned-replies.service";
import {CannedReply} from "../../../shared/models/CannedReply";
import {CrupdateCannedReplyModalComponent} from "../crupdate-canned-reply-modal/crupdate-canned-reply-modal.component";
import {CurrentUser} from "../../../auth/current-user";

@Component({
    selector: 'canned-replies-dropdown',
    templateUrl: './canned-replies-dropdown.component.html',
    styleUrls: ['./canned-replies-dropdown.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CannedRepliesDropdownComponent implements OnInit {

    /**
     * Canned replies search input field control.
     */
    @Input() searchQuery = new FormControl();

    /**
     * Event fired when user clicked on any of this dropdown items.
     */
    @Output() onReplySelect = new EventEmitter();

    /**
     * Set to true if we have already loaded canned replies from server at least once.
     */
    public loadedResultsAtLeastOnce: boolean = false;

    /**
     * Available canned replies.
     */
    public cannedReplies: CannedReply[] = [];

    /**
     * CannedRepliesDropdown constructor.
     */
    constructor(
        private cannedRepliesService: CannedRepliesService,
        private currentUser: CurrentUser,
        private modal: ModalService,
        private conversation: Conversation,
    ) {}

    ngOnInit() {
        this.searchQuery.valueChanges
            .debounceTime(400)
            .distinctUntilChanged()
            .subscribe(query => this.getCannedReplies(query));
    }

    /**
     * Select specified canned reply.
     */
    public selectCannedReply(cannedReply: Reply) {
        this.onReplySelect.emit(cannedReply);
    }

    /**
     * Show modal for creating new canned reply.
     */
    public showNewCannedReplyModal() {
        this.modal.show(CrupdateCannedReplyModalComponent, {cannedReply: this.conversation.draft.get()})
            .onDone.subscribe(cannedReply => this.cannedReplies.unshift(cannedReply));
    }

    /**
     * Get canned replies matching specified query.
     */
    public getCannedReplies(query: string = null) {
        let payload = {query, user_id: this.currentUser.get('id')};

        this.cannedRepliesService.getReplies(payload).subscribe(response => {
            this.loadedResultsAtLeastOnce = true;
            this.cannedReplies = response.data;
        });
    }
}
