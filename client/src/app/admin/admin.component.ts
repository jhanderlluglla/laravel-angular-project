import {Component, ViewEncapsulation} from "@angular/core";
import {SettingsService} from "../shared/settings.service";
import {CurrentUser} from "../auth/current-user";

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class AdminComponent {

    /**
     * Controls left column visibility.
     */
    public leftColumnIsHidden = false;

    constructor(public settings: SettingsService, public currentUser: CurrentUser) {}
}
