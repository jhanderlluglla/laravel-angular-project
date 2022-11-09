import {Component, ViewEncapsulation} from "@angular/core";
import {SettingsPanelComponent} from "../settings-panel.component";

@Component({
    selector: 'cache-settings',
    templateUrl: './cache-settings.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class CacheSettingsComponent extends SettingsPanelComponent {

    /**
     * Whether cache is being cleared currently.
     */
    public loading = false;

    /**
     * Clear website cache.
     */
    public clearCache() {
        this.loading = true;

        this.http.post('cache/clear').subscribe(() => {
            this.loading = false;
            this.toast.show('Cache cleared.');
        });
    }
}
