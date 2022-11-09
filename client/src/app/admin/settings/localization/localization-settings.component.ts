import {Component, ViewEncapsulation} from "@angular/core";
import {SettingsPanelComponent} from "../settings-panel.component";

@Component({
    selector: 'localization-settings',
    templateUrl: './localization-settings.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class LocalizationSettingsComponent extends SettingsPanelComponent {

}
