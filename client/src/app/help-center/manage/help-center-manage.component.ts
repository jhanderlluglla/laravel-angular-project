import {Component, ViewEncapsulation} from '@angular/core';
import {SettingsService} from "../../shared/settings.service";
import {CurrentUser} from "../../auth/current-user";

@Component({
    selector: 'help-center-manage',
    templateUrl: './help-center-manage.component.html',
    styleUrls: ['./help-center-manage.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class HelpCenterManageComponent {

    constructor(public settings: SettingsService, public currentUser: CurrentUser) {}
}
