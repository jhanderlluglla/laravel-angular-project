import {Component, ViewEncapsulation} from "@angular/core";
import {CurrentUser} from "../../auth/current-user";
import {SettingsService} from "../settings.service";

@Component({
    selector: 'customer-navbar',
    templateUrl: './customer-navbar.component.html',
    styleUrls: ['./customer-navbar.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class CustomerNavbarComponent {

    constructor(public currentUser: CurrentUser, public settings: SettingsService) {}
}
