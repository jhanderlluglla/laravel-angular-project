import {Component, Output, EventEmitter, ElementRef, Renderer2} from '@angular/core';
import {BaseModalClass} from "./../../../shared/modal/base-modal";
import {ToastService} from "../../../shared/toast/toast.service";
import {SupervisorsService} from "../supervisors.service";
import {Supervisor} from "../../../shared/models/Supervisor";

@Component({
    selector: 'crupdate-supervisor-modal',
    templateUrl: './crupdate-supervisor-modal.component.html',
    providers: [SupervisorsService],
})
export class CrupdateSupervisorModalComponent extends BaseModalClass {

    /**
     * Supervisor model.
     */
    public model = new Supervisor();

    /**
     * If we are updating existing supervisor or creating a new one.
     */
    public updating: boolean = false;

    constructor(
        protected elementRef: ElementRef, 
        protected renderer: Renderer2, 
        private toast: ToastService, 
        private supervisorsService: SupervisorsService
    ) {
        super(elementRef, renderer);
        this.resetState();
    }

    public close() {
        this.resetState();
        super.close();
    }

    public show(params: {supervisor?: Supervisor} = {}) {
        this.resetState();

        if (params.supervisor) {
            this.updating = true;
            this.hydrateModel(params.supervisor);
        } else {
            this.updating = false;
        }

        super.show(params);
    }

    public confirm() {
        let request;

        if (this.updating) {
            request = this.supervisorsService.update(Object.assign({}, this.model));
        } else {
            request = this.supervisorsService.create(Object.assign({}, this.model));
        }

        request.subscribe(response => {
            super.done(response.data);
            this.toast.show('Supervisor '+(this.updating ? 'Updated' : 'Created'));
            this.close();
        }, this.handleErrors.bind(this));
    }

    /**
     * Reset all modal state to default.
     */
    private resetState() {
        this.errors = {};
    }

    /**
     * Populate supervisor model with given data.
     */
    private hydrateModel(supervisor) {
        Object.assign(this.model, supervisor);
    }
}