import {Component} from '@angular/core';
import {TagService} from "../../shared/tag.service";
import {CrupdateTagModalComponent} from "./crupdate-tag-modal/crupdate-tag-modal.component";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {DataTable} from "../../shared/data-table";
import {Tag} from "../../shared/models/Tag";
import {CurrentUser} from "../../auth/current-user";

@Component({
    selector: 'tags',
    templateUrl: './tags.component.html',
    providers: [TagService, UrlAwarePaginator]
})
export class TagsComponent extends DataTable {

    /**
     * TagsComponent Constructor.
     */
    constructor(
        private tagService: TagService,
        public paginator: UrlAwarePaginator,
        private modal: ModalService,
        public currentUser: CurrentUser,
    ) {
        super();
    }

    ngOnInit() {
        this.paginator.paginate('tags?with_counts=true').subscribe(response => {
            this.items = response.data;
        });
    }

    /**
     * Delete tags that are currently selected by user.
     */
    public deleteSelectedTags() {
        this.tagService.deleteMultiple(this.selectedItems.slice()).subscribe(() => {
            this.deselectAllItems();
            this.onTagChange();
        });
    }

    /**
     * Called when tag is updated or new one is created.
     */
    public onTagChange() {
        this.paginator.refresh();
    }

    /**
     * Ask user to confirm deletion of selected tags
     * and delete selected tags if user confirms.
     */
    public maybeDeleteSelectedTags() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Tags',
            body:  'Are you sure you want to delete selected tags?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteSelectedTags());
    }

    /**
     * Show modal for editing tag if tag is specified
     * or for creating a new tag otherwise.
     */
    public showCrupdateTagModal(tag?: Tag) {
        this.modal.show(CrupdateTagModalComponent, {tag}).onDone.subscribe(() => this.onTagChange())
    }
}
