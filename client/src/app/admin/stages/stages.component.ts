import {Component} from '@angular/core';
import {StagesService} from "./stages.service";
import {CrupdateStageModalComponent} from "./crupdate-stage-modal/crupdate-stage-modal.component";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {DataTable} from "../../shared/data-table";
import {Stage} from "../../shared/models/Stage";

@Component({
    selector: 'stages',
    templateUrl: './stages.component.html',
    providers: [StagesService, UrlAwarePaginator]
})

export class StagesComponent extends DataTable {

    /**
     * StagesComponent Constructor.
     */
    constructor(
        private stageService: StagesService,
        public paginator: UrlAwarePaginator,
        private modal: ModalService
    ) {
        super();
    }

    ngOnInit() {
        this.paginator.paginate('stages?with_counts=true').subscribe(response => {
            this.items = response.data;
        });
    }

    /**
     * Called when stage is updated or new one is created.
     */
    public onStageChange() {
        this.paginator.refresh();
    }


    /**
     * Show modal for editing stage if stage is specified
     * or for creating a new stage otherwise.
     */
    public showCrupdateStageModal(stage?: Stage) {
        this.modal.show(CrupdateStageModalComponent, {stage}).onDone.subscribe(() => this.onStageChange())
    }

    public maybeDeleteSelectedStages() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Stages',
            body:  'Are you sure you want to delete selected stages?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteSelectedStages());
    }

    public deleteSelectedStages() {
        this.stageService.delete(this.selectedItems.slice()).subscribe(() => {
            this.deselectAllItems();
            this.onStageChange();
        });
    }
}
