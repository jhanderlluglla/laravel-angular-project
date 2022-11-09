import {Component, Output, EventEmitter, ElementRef, Renderer2} from '@angular/core';
import {BaseModalClass} from "./../../../shared/modal/base-modal";
import {ToastService} from "../../../shared/toast/toast.service";
import {TagService} from "../../../shared/tag.service";
import {Tag} from "../../../shared/models/Tag";

@Component({
    selector: 'crupdate-tag-modal',
    templateUrl: './crupdate-tag-modal.component.html',
    providers: [TagService],
})
export class CrupdateTagModalComponent extends BaseModalClass {

    /**
     * Available tag types.
     */
    public tagTypes = ['default', 'category', 'custom'];

    /**
     * Tag model.
     */
    public model: any;

    /**
     * If we are updating existing tag or creating a new one.
     */
    public updating: boolean = false;

    constructor(protected elementRef: ElementRef, protected renderer: Renderer2, private toast: ToastService, private tagService: TagService) {
        super(elementRef, renderer);
        this.resetState();
    }

    public close() {
        this.resetState();
        super.close();
    }

    public show(params: {tag?: Tag} = {}) {
        this.resetState();

        if (params.tag) {
            this.updating = true;
            this.hydrateModel(params.tag);
        } else {
            this.updating = false;
        }

        super.show(params);
    }

    public confirm() {
        let request;

        if (this.updating) {
            request = this.tagService.update(this.model.id, Object.assign({}, this.model));
        } else {
            request = this.tagService.createNew(Object.assign({}, this.model));
        }

        request.subscribe(response => {
            super.done(response.data);
            this.toast.show('Tag '+(this.updating ? 'Updated' : 'Created'));
            this.close();
        }, this.handleErrors.bind(this));
    }

    /**
     * Reset all modal state to default.
     */
    private resetState() {
        this.model = {type: 'custom'};
        this.errors = {};
    }

    /**
     * Populate tag model with given data.
     */
    private hydrateModel(tag) {
        Object.assign(this.model, tag);
    }
}