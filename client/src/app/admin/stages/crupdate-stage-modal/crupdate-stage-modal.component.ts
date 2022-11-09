import {Component, Output, EventEmitter, ElementRef, Renderer2} from '@angular/core';
import {BaseModalClass} from "./../../../shared/modal/base-modal";
import {ToastService} from "../../../shared/toast/toast.service";
import {StagesService} from "../stages.service";
import {Stage} from "../../../shared/models/Stage";

@Component({
    selector: 'crupdate-stage-modal',
    templateUrl: './crupdate-stage-modal.component.html',
    providers: [StagesService],
})
export class CrupdateStageModalComponent extends BaseModalClass {

    /**
     * Stage model.
     */
    public model = new Stage();

    /**
     * If we are updating existing stage or creating a new one.
     */
    public updating: boolean = false;

    constructor(
        protected elementRef: ElementRef, 
        protected renderer: Renderer2, 
        private toast: ToastService, 
        private stagesService: StagesService
    ) {
        super(elementRef, renderer);
        this.resetState();
    }

    public close() {
        this.resetState();
        super.close();
    }

    public show(params: {stage?: Stage} = {}) {
        this.resetState();

        if (params.stage) {
            this.updating = true;
            this.hydrateModel(params.stage);
        } else {
            this.updating = false;
        }

        super.show(params);
    }

    public confirm() {
        let request;

        if (this.updating) {
            request = this.stagesService.update(Object.assign({}, this.model));
        } else {
            request = this.stagesService.create(Object.assign({}, this.model));
        }

        request.subscribe(response => {
            super.done(response.data);
            this.toast.show('Stage '+(this.updating ? 'Updated' : 'Created'));
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
     * Populate stage model with given data.
     */
    private hydrateModel(stage) {
        Object.assign(this.model, stage);
    }
}