import {NgModule, APP_INITIALIZER, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule, BrowserXhr} from '@angular/http';
import {routing} from './app.routing';
import {AppComponent} from "./app.component";
import {SharedModule} from "./shared.module";
import {AuthModule} from "./auth/auth.module";
import {Bootstrapper} from "./bootstrapper.service";
import {CurrentUser} from "./auth/current-user";
import {CustomBrowserXhr} from "./custom-browser-xhr";
import {AuthGuard} from "./guards/auth-guard.service";
import {GuestGuard} from "./guards/guest-guard.service";
import {BrowserEvents} from "./shared/browser-events.service";
import {UploadProgressService} from "./shared/upload-progress.service";
import {SettingsService} from "./shared/settings.service";
import {utils} from "./shared/utils";
import {FileValidator} from "./shared/file-validator";
import {ToastService} from "./shared/toast/toast.service";
import {HttpClient} from "./shared/http-client";
import {HelpCenterModule} from "./help-center/front/help-center.module";
import {ModalPlaceholderService} from "./shared/modal/modal-placeholder.service";
import {HcUrls} from "./help-center/shared/hc-urls.service";
import {DropdownService} from "./shared/dropdown/dropdown.service";
import {UserModule} from "./user/user.module";
import {ValueListsService} from "./shared/value-lists.service";
import {HttpCacheClient} from "./shared/http-cache-client";
import {LocalStorage} from "./shared/local-storage.service";
import {DisableRouteGuard} from "./guards/disable-route-guard.service";
import {RouterModule} from "@angular/router";
import {RavenErrorHandler} from "./raven-error-handler";
import {BackendEvents} from "./shared/backend-events";
import {MailboxTagsService} from "./ticketing/mailbox-tags.service";
import {PreviewApp} from "./shared/preview-app.service";
import {Translations} from "./shared/translations/translations.service";
import {RouterHistory} from "./shared/router-history.service";
import {TitleService} from "./shared/title.service";
import {CheckPermissionsGuard} from "./guards/check-permissions-guard.service";
import {Pages} from "./admin/pages/pages.service";

export function init_app(bootstrapper: Bootstrapper) {
    return () => bootstrapper.bootstrap();
}

export function errorHandlerFactory (settings: SettingsService) {
    return new RavenErrorHandler(settings);
}

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        SharedModule,
        AuthModule,
        UserModule,
        HelpCenterModule,
        routing,
    ],
    bootstrap: [AppComponent],
    providers: [
        SettingsService,
        {
            provide: APP_INITIALIZER,
            useFactory: init_app,
            deps: [Bootstrapper],
            multi: true,
        },
        { provide: ErrorHandler,
            useFactory: errorHandlerFactory,
            deps: [SettingsService],
        },
        {provide: BrowserXhr, useClass: CustomBrowserXhr},
        CurrentUser,
        AuthGuard,
        GuestGuard,
        CheckPermissionsGuard,
        DisableRouteGuard,
        Bootstrapper,
        BrowserEvents,
        BackendEvents,
        UploadProgressService,
        utils,
        FileValidator,
        ToastService,
        ModalPlaceholderService,
        HttpClient,
        HcUrls,
        ValueListsService,
        DropdownService,
        HttpCacheClient,
        LocalStorage,
        MailboxTagsService,
        PreviewApp,
        Translations,
        RouterHistory,
        TitleService,
        Pages,
    ]
})
export class AppModule {}