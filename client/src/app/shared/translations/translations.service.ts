import {EventEmitter, Injectable, Injector} from "@angular/core";
import {HttpClient} from "../http-client";
import {Observable} from "rxjs/Observable";
import {SettingsService} from "../settings.service";
import {Localization} from "../models/Localization";

@Injectable()
export class Translations {

    /**
     * Fired when active localization changes.
     */
    public localizationChange = new EventEmitter;

    /**
     * Currently active localization.
     */
    private localization: Localization = new Localization({lines: []});

    /**
     * Translations Service Constructor.
     */
    constructor(private injector: Injector) {}

    /**
     * Translate specified key.
     */
    public t(transKey: string, values = {}): string {
        if ( ! this.translationsEnabled()) return transKey;

        let translation = this.localization.lines[transKey] || transKey;

        //replace placeholders with specified values
        for (let key in values) {
            translation = translation.replace(':'+key, values[key]);
        }

        return translation;
    }

    /**
     * Get currently active localization.
     */
    public getLocalization(): Localization {
        return this.localization;
    }

    /**
     * Set localization by specified name.
     */
    public setLocalizationByName(name: string) {
        if (this.localization.name === name) return;

        this.getLocalizationByName(name).subscribe(lang => {
            this.setLocalization(lang);
        });
    }

    /**
     * Get localization from backend by specified name.
     */
    public getLocalizationByName(name: string): Observable<Localization> {
        let http = this.injector.get(HttpClient);
        return http.get('admin/localizations/'+name);
    }

    /**
     * Set active localization.
     */
    public setLocalization(localization: Localization) {
        if (this.localization.name === name) return;
        if ( ! localization || ! localization.lines) return;

        this.localization = localization;
        this.localizationChange.emit();
    }

    /**
     * Check if i18n functionality is enabled.
     */
    private translationsEnabled(): boolean {
        return this.injector.get(SettingsService).get('i18n.enable');
    }
}
