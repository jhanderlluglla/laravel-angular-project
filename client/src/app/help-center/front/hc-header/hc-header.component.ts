import {Component, ViewEncapsulation} from "@angular/core";
import {SettingsService} from "../../../shared/settings.service";

@Component({
    selector: 'hc-header',
    templateUrl: './hc-header.component.html',
    styleUrls: ['./hc-header.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class HcHeaderComponent {
    constructor(public settings: SettingsService) {}
}
