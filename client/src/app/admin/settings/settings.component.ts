import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {SettingsService} from "../../shared/settings.service";
import {UploadsService} from "../../shared/uploads.service";
import {ActivatedRoute} from "@angular/router";
import {SettingsState} from "./settings-state.service";

@Component({
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    providers: [UploadsService],
    encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit {

    constructor(
        private settings: SettingsService,
        private route: ActivatedRoute,
        private state: SettingsState,
    ) {}

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.state.setAll(data['settings']);
        });
    }
}
