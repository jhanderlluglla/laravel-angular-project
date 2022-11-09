import {Component, ViewEncapsulation} from "@angular/core";
import {ReportsService} from "./reports.service";
import {SettingsService} from "../../shared/settings.service";

@Component({
    selector: 'reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss'],
    providers: [ReportsService],
    encapsulation: ViewEncapsulation.None,
})

export class ReportsComponent {

    constructor(private reports: ReportsService, public settings: SettingsService) {}
}
