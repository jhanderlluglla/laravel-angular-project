import {Component, ViewEncapsulation} from "@angular/core";
import {SettingsPanelComponent} from "../settings-panel.component";
import {UploadsService} from "../../../shared/uploads.service";
import {ConfirmModalComponent} from "../../../shared/modal/confirm-modal/confirm-modal.component";

@Component({
    selector: 'help-center-settings',
    templateUrl: './help-center-settings.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class HelpCenterSettingsComponent extends SettingsPanelComponent {

    /**
     * Whether help center data is being imported/exported currently.
     */
    public loading = false;

    /**
     * Ask user to confirm help center data import.
     */
    public confirmHelpCenterImport() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Import Help Center Data',
            body:  'Are you sure you want to import help center data?',
            bodyBold: 'This will erase all existing articles and categories.',
            ok:    'Import'
        }).onDone.subscribe(() => this.importHelpCenterData());
    }

    /**
     * Import help center data from .zip file into the site.
     */
    public importHelpCenterData() {
        this.uploads.openUploadDialog({accept: '.zip'}).then(files => {
            let payload = new FormData();
            payload.append('data', files.item(0));

            this.loading = true;

            this.http.post('help-center/actions/import', payload).subscribe(() => {
                this.toast.show('Imported Help Center Data');
                this.loading = false;
            }, () => this.loading = false);
        });
    }

    /**
     * Export current help center data as a .zip file.
     */
    public exportHelpCenterData() {
        UploadsService.downloadFileFromUrl(
            this.settings.getBaseUrl() + 'secure/help-center/actions/export', 'hc-export.json'
        );
    }
}
