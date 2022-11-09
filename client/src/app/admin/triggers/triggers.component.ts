import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {TriggersService} from "./triggers.service";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {DataTable} from "../../shared/data-table";
import {ModalService} from "../../shared/modal/modal.service";
import {Trigger} from "../../shared/models/Trigger";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";

@Component({
    selector: 'triggers',
    templateUrl: './triggers.component.html',
    styleUrls: ['./triggers.component.scss'],
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None,
})

export class TriggerComponent extends DataTable implements OnInit {

    /**
     * TriggersComponent Constructor.
     */
    constructor(
        public paginator: UrlAwarePaginator,
        private modal: ModalService,
        private triggers: TriggersService
    ) {
        super();
    }

    ngOnInit() {
        this.paginator.paginate('triggers').subscribe((response: {data: Trigger[]}) => {
            this.items = response.data;
        });
    }

    /**
     * Ask user to confirm deletion of selected triggers
     * and delete selected triggers if user confirms.
     */
    public confirmTriggersDeletion() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Triggers',
            body:  'Are you sure you want to delete selected triggers?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteSelectedTriggers());
    }

    /**
     * Delete currently selected pages.
     */
    public deleteSelectedTriggers() {
        this.triggers.delete(this.selectedItems).subscribe(() => {
            this.paginator.refresh();
            this.selectedItems = [];
        });
    }
}
