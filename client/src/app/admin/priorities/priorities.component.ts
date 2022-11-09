import {Component} from '@angular/core';
import {PrioritiesService} from "./priorities.service";
import {CrupdatePriorityModalComponent} from "./crupdate-priority-modal/crupdate-priority-modal.component";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {DataTable} from "../../shared/data-table";
import {Priority} from "../../shared/models/Priority";

@Component({
    selector: 'priorities',
    templateUrl: './priorities.component.html',
    providers: [PrioritiesService, UrlAwarePaginator]
})

export class PrioritiesComponent extends DataTable {

    /**
     * PrioritiesComponent Constructor.
     */
    constructor(
        private priorityService: PrioritiesService,
        public paginator: UrlAwarePaginator,
        private modal: ModalService
    ) {
        super();
    }

    ngOnInit() {
        this.paginator.paginate('priorities?with_counts=true').subscribe(response => {
            this.items = response.data;
        });
    }

    /**
     * Called when priority is updated or new one is created.
     */
    public onPriorityChange() {
        this.paginator.refresh();
    }


    /**
     * Show modal for editing priority if priority is specified
     * or for creating a new priority otherwise.
     */
    public showCrupdatePriorityModal(priority?: Priority) {
        this.modal.show(CrupdatePriorityModalComponent, {priority}).onDone.subscribe(() => this.onPriorityChange())
    }

    public maybeDeleteSelectedPriorities() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Priorities',
            body:  'Are you sure you want to delete selected prioritys?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteSelectedPriorities());
    }

    public deleteSelectedPriorities() {
        this.priorityService.delete(this.selectedItems.slice()).subscribe(() => {
            this.deselectAllItems();
            this.onPriorityChange();
        });
    }
}
