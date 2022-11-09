import {Component, ViewEncapsulation} from "@angular/core";
import {SettingsPanelComponent} from "../settings-panel.component";

@Component({
    selector: 'realtime-settings',
    templateUrl: './realtime-settings.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class RealtimeSettingsComponent extends SettingsPanelComponent {

    /**
     * Save current settings to the server.
     */
    public saveSettings() {
        let settings = this.state.getModified();

        //need to save pusher key to both .env file and database
        //because it is used on server side and on client side
        if (settings.client['realtime.pusher_key']) {
            settings.server['pusher_key'] = settings.client['realtime.pusher_key']
        }

        super.saveSettings(settings);
    }
}
