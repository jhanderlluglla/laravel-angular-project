import {Component, ViewEncapsulation} from "@angular/core";
import {SettingsService} from "../../shared/settings.service";
import {ToastService} from "../../shared/toast/toast.service";
import {HttpClient} from "../../shared/http-client";
import {UploadsService} from "../../shared/uploads.service";
import {ModalService} from "../../shared/modal/modal.service";
import {SettingsState} from "./settings-state.service";

@Component({
    selector: 'settings-panel',
    template: '',
    encapsulation: ViewEncapsulation.None,
})
export class SettingsPanelComponent {

    constructor(
        protected settings: SettingsService,
        protected toast: ToastService,
        protected http: HttpClient,
        protected uploads: UploadsService,
        protected modal: ModalService,
        public state: SettingsState,
    ) {}

    /**
     * Save current settings to the server.
     */
    public saveSettings(settings?: Object) {
        this.settings.save(settings || this.state.getModified()).subscribe(() => {
            this.toast.show('Saved settings');
        });
    }
}
