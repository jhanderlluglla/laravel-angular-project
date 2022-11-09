import {Component, ElementRef, OnInit, ViewChild, ViewContainerRef, Renderer2, ViewEncapsulation} from '@angular/core';
import {ToastComponent} from "./shared/toast/toast.component";
import {BrowserEvents} from "./shared/browser-events.service";
import {ToastService} from "./shared/toast/toast.service";
import {ModalPlaceholderService} from "./shared/modal/modal-placeholder.service";
import {BackendEvents} from "./shared/backend-events";
import {PreviewApp} from "./shared/preview-app.service";
import {RouterHistory} from "./shared/router-history.service";
import {TitleService} from "./shared/title.service";
import {SettingsService} from "./shared/settings.service";
import {HttpClient} from "./shared/http-client";
import {RouteConfigLoadEnd, RouteConfigLoadStart, Router} from "@angular/router";

declare let svg4everybody: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {'[class.loading]': 'isLoading'}
})
export class AppComponent implements OnInit {
    @ViewChild(ToastComponent) toast: ToastComponent;
    @ViewChild('modalPlaceholder', {read: ViewContainerRef}) modalPlaceholderRef;
    @ViewChild('appContent') appContentEl;

    /**
     * Whether global loading indicator should be displayed.
     */
    public isLoading = false;

    constructor (
        private el: ElementRef,
        private browserEvents: BrowserEvents,
        private toastService: ToastService,
        private renderer: Renderer2,
        private modalPlaceholder: ModalPlaceholderService,
        private backendEvents: BackendEvents,
        private previewApp: PreviewApp,
        private routerHistory: RouterHistory,
        private title: TitleService,
        private settings: SettingsService,
        private http: HttpClient,
        private router: Router
    ) { }

    ngOnInit() {
        this.toastService.registerComponentInstance(this.toast);
        this.modalPlaceholder.registerViewContainerRef(this.modalPlaceholderRef, this.appContentEl.nativeElement);
        this.browserEvents.subscribeToEvents(this.el.nativeElement, this.renderer);

        //svg icons polyfill
        svg4everybody();

        //bootstrap real time backend events
        this.backendEvents.init();

        //init routing history service
        this.routerHistory.init();

        //init preview app service
        this.previewApp.init();

        //init title service
        this.title.init();

        //settings service is needed before/during angular bootstrap
        //so we need to set http client on it here, because some http
        //will not be ready yet if we use constructor injection
        this.settings.setHttpClient(this.http);

        this.enableTransitionOnChunkLoad();
    }

    /**
     * Show a transition animation when chunks
     * are being lazy loaded by angular.
     */
    private enableTransitionOnChunkLoad() {
        this.router.events
            .subscribe(e => {
                if (e instanceof RouteConfigLoadStart) {
                    this.isLoading = true;
                } else if (e instanceof RouteConfigLoadEnd) {
                    this.isLoading = false;
                }
            });
    }
}
