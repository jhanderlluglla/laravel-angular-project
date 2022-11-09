import {Component, ElementRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {BaseModalClass} from "../../../shared/modal/base-modal";
import {HttpClient} from "../../../shared/http-client";
import {Localization} from "../../../shared/models/Localization";

@Component({
    selector: 'crupdate-localization-modal',
    templateUrl: './crupdate-localization-modal.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class CrupdateLocalizationModalComponent extends BaseModalClass {

    /**
     * Localization model.
     */
    public localization: Localization = new Localization();

    /**
     * Whether localization creation is currently in progress.
     */
    public loading = false;

    /**
     * CrupdateLocalizationModalComponent Constructor.
     */
    constructor(protected el: ElementRef, protected renderer: Renderer2, private http: HttpClient) {
        super(el, renderer);
    }

    /**
     * Show the modal.
     */
    public show(params: { localization?: Localization }) {
        super.show(params);

        if (params.localization) {
            this.localization = params.localization;
        }
    }

    /**
     * Create new localization or update existing one.
     */
    public confirm() {
        this.loading = true;

        let request = this.localization.id ? this.updateLocalization() : this.createNewLocalization();

        request.subscribe(lang => {
            this.loading = false;
            super.done(lang);
        }, errors => {
            this.loading = false;
            this.handleErrors(errors);
        });
    }

    /**
     * Create a new localization.
     */
    public createNewLocalization() {
        return this.http.post('admin/localizations', this.getPayload());
    }

    /**
     * Update existing localization.
     */
    public updateLocalization() {
        return this.http.put('admin/localizations/' + this.localization.id, this.getPayload());
    }

    /**
     * Get payload for creating/updating localization.
     */
    private getPayload() {
        return {name: this.localization.name};
    }
}