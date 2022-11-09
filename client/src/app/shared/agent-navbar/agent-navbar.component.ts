import {Component, ViewEncapsulation} from "@angular/core";
import {CurrentUser} from "../../auth/current-user";
import {SettingsService} from "../settings.service";

@Component({
    selector: 'agent-navbar',
    templateUrl: './agent-navbar.component.html',
    styleUrls: ['./agent-navbar.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class AgentNavbarComponent {
    constructor(public currentUser: CurrentUser, public settings: SettingsService) {}
}
