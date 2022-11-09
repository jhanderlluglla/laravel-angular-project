import { Injectable, Injector } from '@angular/core';
import {SettingsService} from "./shared/settings.service";
import {CurrentUser} from "./auth/current-user";
import {Http} from "@angular/http";
import {MailboxTagsService} from "./ticketing/mailbox-tags.service";
import {Translations} from "./shared/translations/translations.service";

@Injectable()
export class Bootstrapper {

    /**
     * HttpClient service instance.
     */
    private http: Http;

    /**
     * Settings service instance.
     */
    private settings: SettingsService;

    /**
     * CurrentUser service instance.
     */
    private currentUser: CurrentUser;

    /**
     * Translations service instance.
     */
    private i18n: Translations;

    /**
     * Boostrapper constructor.
     */
    constructor(private injector: Injector) {
        this.http = this.injector.get(Http);
        this.settings = this.injector.get(SettingsService);
        this.currentUser = this.injector.get(CurrentUser);
        this.i18n = this.injector.get(Translations);
    }

    /**
     * Bootstrap application with data returned from server.
     */
    public bootstrap(): Promise<any> {

        //if we have bootstrap data in global scope, pass
        //it to the app and return self resolving promise
        if (window['bootstrapData']) {
            this.handleData(window['bootstrapData']);
            return new Promise(resolve => resolve());
        }

        //fetch bootstrap data from backend and return promise that
        //resolves once request is complete and data is passed to the app
        return new Promise((resolve, reject) => {
            let url = this.settings.getBaseUrl() + 'secure/bootstrap-data';
            this.http.get(url).subscribe(response => {
                this.handleData(response.json().data);
                resolve();
            }, error => {
                console.log('error', error);
                reject();
            });
        });
    }

    /**
     * Handle specified bootstrap data.
     */
    private handleData(encodedData: string) {
        //decode bootstrap data from server
        let data = JSON.parse(atob(encodedData));

        //set all settings returned from server
        this.settings.setMultiple(data['settings']);

        //set current user and default group for guests
        this.currentUser.init({
            guestsGroup: data['guests_group'],
            user: data['user']
        });

        //set csrf token
        this.settings.csrfToken = data['csrf_token'];

        //set translations
        if (data['i18n']) {
            this.i18n.setLocalization(data['i18n']);
        }

        //init mailbox tags service
        this.injector.get(MailboxTagsService).setTags(data['tags']);
    }
}