import {ErrorHandler} from "@angular/core";
import {SettingsService} from "./shared/settings.service";
import * as Raven from 'raven-js';
import {environment} from "../environments/environment";

export class RavenErrorHandler extends ErrorHandler {

    /**
     * Whether sentry error logger is already installed.
     */
    private installed = false;

    /**
     * RavenErrorHandler Constructor.
     */
    constructor(private settings: SettingsService) {
        super();
    }

    /**
     * Handle specified error.
     */
    public handleError(err: any): void {
        //if there's no error, or it's a validation error return, bail
        if ( ! err || (err.type === 'http' && err.status === 403)) return;

        if ( ! environment.production) {
            super.handleError(err);
        }

        //sentry did not install properly
        if ( ! this.installSentry()) return;

        Raven.captureException(err.originalError || err);
    }

    /**
     * Install sentry error logger.
     */
    private installSentry(): boolean {
        //already installed
        if (this.installed) return true;

        //no sentry public key is set
        if ( ! this.settings.has('logging.sentry_public')) return false;

        //install
        Raven.config(this.settings.get('logging.sentry_public')).install();
        return this.installed = true;
    }
}