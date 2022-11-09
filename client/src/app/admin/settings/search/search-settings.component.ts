import {Component, ViewEncapsulation} from "@angular/core";
import {SettingsPanelComponent} from "../settings-panel.component";

@Component({
    selector: 'search-settings',
    templateUrl: './search-settings.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class SearchSettingsComponent extends SettingsPanelComponent {}
