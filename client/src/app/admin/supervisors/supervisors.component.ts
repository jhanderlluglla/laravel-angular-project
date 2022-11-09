import {Component} from '@angular/core';
import {SupervisorsService} from "./supervisors.service";
import {CrupdateSupervisorModalComponent} from "./crupdate-supervisor-modal/crupdate-supervisor-modal.component";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {DataTable} from "../../shared/data-table";
import {Supervisor} from "../../shared/models/Supervisor";

@Component({
    selector: 'supervisors',
    templateUrl: './supervisors.component.html',
    providers: [SupervisorsService, UrlAwarePaginator]
})

export class SupervisorsComponent extends DataTable {

    /**
     * SupervisorsComponent Constructor.
     */
    constructor(
        private supervisorService: SupervisorsService,
        public paginator: UrlAwarePaginator,
        private modal: ModalService
    ) {
        super();
    }

    ngOnInit() {
        this.paginator.paginate('supervisors?with_counts=true').subscribe(response => {
            this.items = response.data;
        });
    }

    /**
     * Called when supervisor is updated or new one is created.
     */
    public onSupervisorChange() {
        this.paginator.refresh();
    }


    /**
     * Show modal for editing supervisor if supervisor is specified
     * or for creating a new supervisor otherwise.
     */
    public showCrupdateSupervisorModal(supervisor?: Supervisor) {
        this.modal.show(CrupdateSupervisorModalComponent, {supervisor}).onDone.subscribe(() => this.onSupervisorChange())
    }

    public maybeDeleteSelectedSupervisors() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Supervisors',
            body:  'Are you sure you want to delete selected supervisors?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteSelectedSupervisors());
    }

    public deleteSelectedSupervisors() {
        this.supervisorService.delete(this.selectedItems.slice()).subscribe(() => {
            this.deselectAllItems();
            this.onSupervisorChange();
        });
    }
}
