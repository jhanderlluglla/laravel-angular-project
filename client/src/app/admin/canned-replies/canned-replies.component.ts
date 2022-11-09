import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {DataTable} from "../../shared/data-table";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {CannedRepliesService} from "../../ticketing/canned-replies/canned-replies.service";
import {ModalService} from "../../shared/modal/modal.service";
import {CannedReply} from "../../shared/models/CannedReply";
import {CrupdateCannedReplyModalComponent} from "../../ticketing/canned-replies/crupdate-canned-reply-modal/crupdate-canned-reply-modal.component";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {CurrentUser} from "../../auth/current-user";

@Component({
    selector: 'canned-replies',
    templateUrl: './canned-replies.component.html',
    styleUrls: ['./canned-replies.component.scss'],
    providers: [UrlAwarePaginator, CannedRepliesService],
    encapsulation: ViewEncapsulation.None,
})
export class CannedRepliesComponent extends DataTable implements OnInit {

    /**
     * CannedRepliesComponent Constructor.
     */
    constructor(
        public paginator: UrlAwarePaginator,
        private replies: CannedRepliesService,
        private modal: ModalService,
        public currentUser: CurrentUser,
    ) {
        super();
    }

    /**
     * Called after data-bound properties are initialized.
     */
    ngOnInit() {
        this.paginator.paginate('canned-replies', {relations: 'user'}).subscribe(response => {
            this.items = response.data;
        });
    }

    /**
     * Show modal for editing user if user is specified
     * or for creating a new user otherwise.
     */
    public showCrupdateModal(cannedReply?: CannedReply) {
        this.modal.show(CrupdateCannedReplyModalComponent, {cannedReply})
            .onDone.subscribe(() => this.refreshPaginator());
    }

    /**
     * Ask user to confirm deletion of selected items
     * and delete selected items if user confirms.
     */
    public confirmDeletion() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Canned Replies',
            body:  'Are you sure you want to delete selected replies?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteSelectedUsers());
    }

    /**
     * Delete currently selected items.
     */
    public deleteSelectedUsers() {
        this.replies.delete(this.selectedItems).subscribe(() => {
            this.refreshPaginator();
        })
    }

    /**
     * Refresh the paginator.
     */
    public refreshPaginator() {
        this.paginator.refresh();
        this.selectedItems = [];
    }

}
