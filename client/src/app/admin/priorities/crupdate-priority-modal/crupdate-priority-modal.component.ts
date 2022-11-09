import {Component, Output, EventEmitter, ElementRef, Renderer2} from '@angular/core';
import {BaseModalClass} from "./../../../shared/modal/base-modal";
import {ToastService} from "../../../shared/toast/toast.service";
import {PrioritiesService} from "../priorities.service";
import {Priority} from "../../../shared/models/Priority";

@Component({
    selector: 'crupdate-priority-modal',
    templateUrl: './crupdate-priority-modal.component.html',
    providers: [PrioritiesService],
})
export class CrupdatePriorityModalComponent extends BaseModalClass {

    /**
     * Priority model.
     */
    public model = new Priority();

    /**
     * If we are updating existing priority or creating a new one.
     */
    public updating: boolean = false;

    constructor(
        protected elementRef: ElementRef, 
        protected renderer: Renderer2, 
        private toast: ToastService, 
        private prioritiesService: PrioritiesService
    ) {
        super(elementRef, renderer);
        this.resetState();
    }

    public close() {
        this.resetState();
        super.close();
    }

    public show(params: {priority?: Priority} = {}) {
        this.resetState();

        if (params.priority) {
            this.updating = true;
            this.hydrateModel(params.priority);
        } else {
            this.updating = false;
        }

        super.show(params);
    }

    public confirm() {
        let request;

        if (this.updating) {
            request = this.prioritiesService.update(Object.assign({}, this.model));
        } else {
            request = this.prioritiesService.create(Object.assign({}, this.model));
        }

        request.subscribe(response => {
            super.done(response.data);
            this.toast.show('Priority '+(this.updating ? 'Updated' : 'Created'));
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
     * Populate priority model with given data.
     */
    private hydrateModel(priority) {
        Object.assign(this.model, priority);
    }
}