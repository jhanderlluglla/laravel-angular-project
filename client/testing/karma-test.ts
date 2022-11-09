import {TestBed, ComponentFixture, TestModuleMetadata} from "@angular/core/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpModule, Http, BaseRequestOptions} from "@angular/http";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {CurrentUser} from "../src/app/auth/current-user";
import {HttpClient} from "../src/app/shared/http-client";
import {ModalService} from "../src/app/shared/modal/modal.service";
import {BrowserEvents} from "../src/app/shared/browser-events.service";
import {ToastService} from "../src/app/shared/toast/toast.service";
import {SvgIconComponent} from "../src/app/shared/svg-icon/svg-icon.component";
import {By} from "@angular/platform-browser";
import {MockBackend} from "@angular/http/testing";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {DebugElement, Type} from "@angular/core";
import {UploadProgressService} from "../src/app/shared/upload-progress.service";
import {SettingsService} from "../src/app/shared/settings.service";
import {TinymceTextEditor} from "../src/app/text-editor/editors/tinymce-text-editor.service";
import {HtmlTextEditor} from "../src/app/text-editor/editors/html-text-editor.service";
import {utils} from "../src/app/shared/utils";
import {InfiniteScrollDirective} from "../src/app/shared/infinite-scroll/infinite-scroll.directive";
import {CustomScrollbarDirective} from "../src/app/shared/custom-scrollbar/custom-scrollbar.directive";
import {ModalPlaceholderService} from "../src/app/shared/modal/modal-placeholder.service";
import {User} from "../src/app/shared/models/User";
import {DropdownComponent} from "../src/app/shared/dropdown/dropdown.component";
import {DropdownService} from "../src/app/shared/dropdown/dropdown.service";
import {modelFactory} from "./model-factory";
import {HttpCacheClient} from "../src/app/shared/http-cache-client";
import {LocalStorage} from "../src/app/shared/local-storage.service";
import {Translations} from "../src/app/shared/translations/translations.service";

export class KarmaTest<T> {

    private baseModuleConfig = {
        declarations: [DropdownComponent, SvgIconComponent, InfiniteScrollDirective, CustomScrollbarDirective],
        imports: [RouterTestingModule, HttpModule, ReactiveFormsModule, FormsModule],
        exports: [DropdownComponent, SvgIconComponent],
        providers: [
            CurrentUser, HttpClient, HttpCacheClient, ModalService, ModalPlaceholderService, BrowserEvents, DropdownService, Translations,
            MockBackend, BaseRequestOptions, UploadProgressService, SettingsService, TinymceTextEditor, HtmlTextEditor, utils, LocalStorage,
            {
                provide: Http,
                useFactory: (mockBackend, options) => {
                    return new Http(mockBackend, options);
                },
                deps: [MockBackend, BaseRequestOptions]
            },
            {
                provide: ToastService,
                useValue: {show: function() {}}
            }
        ],
    };

    private currentUser = new User({
        id: 999,
        email: 'admin@admin.com',
        avatar: 'image.png',
        permissions: {superAdmin : true},
        display_name: 'AdminUser',
    });

    /**
     * Specified component fixture.
     */
    public fixture: ComponentFixture<T>;

    /**
     * Specified component instance.
     */
    public component: T;

    constructor(config?: {module: Object, component: Type<T>}) {
        if ( ! config) return;

        this.configureTestingModule(config['module']);
        TestBed.get(SettingsService).set('text_editor_driver', 'HtmlTextEditor');
        this.setBaseUrl();
        this.createTestComponent(config['component']);
    }

    public createTestComponent(componentType: Type<any>) {
        this.fixture = TestBed.createComponent(componentType);
        this.component = this.fixture.componentInstance;
    }

    /**
     * Retrieve an instance from injector matching specified type.
     */
    public get<T>(type: Type<T>): T {
        return this.fixture.debugElement.injector.get(type);
    }

    public find(css: string): HTMLElement {
        return this.fixture.debugElement.nativeElement.querySelector(css);
    }

    public typeIntoEl(selector: string, text: string) {
        this.find(selector)['value'] = text;
        this.find(selector).dispatchEvent(new Event('input'));
        this.fixture.detectChanges();
    }

    public chooseSelectValue(selector: string, value: string) {
        this.find(selector)['value'] = value;
        this.dispatchEvent(selector, 'change');
    }

    public dispatchEvent(el: string|HTMLElement, eventName: string, data = {}) {
        if (typeof el === 'string') el = this.find(el);
        el.dispatchEvent(Object.assign(new Event(eventName), data));
        this.fixture.detectChanges();
    }

    public toggleCheckbox(selector: string) {
        let checkbox = this.find(selector);
        checkbox['checked'] = !checkbox['checked'];
        this.dispatchEvent(selector, 'change');
    }

    public findDebugEl(css: string): DebugElement {
        return this.fixture.debugElement.query(By.css(css));
    }

    public findAllDebugEl(css: string): DebugElement[] {
        return this.fixture.debugElement.queryAll(By.css(css));
    }

    public findAll(css: string): HTMLElement[] {
        return this.fixture.debugElement.nativeElement.querySelectorAll(css);
    }

    public getChildComponent(type): any {
        let debugEl = this.fixture.debugElement.query(By.directive(type));

        if ( ! debugEl) return;

        if (debugEl.componentInstance && debugEl.componentInstance === type) {
            return debugEl.componentInstance;
        } else {
            return debugEl.injector.get(type);
        }
    }

    /**
     * Login in as administrator with a mock account.
     */
    public logInAsAdmin() {
        let currentUser = this.fixture.debugElement.injector.get(CurrentUser);
        currentUser.assignCurrent(this.currentUser);
    }

    /**
     * Log current user out.
     */
    public logOut() {
        let currentUser = this.fixture.debugElement.injector.get(CurrentUser);
        currentUser.clear();
        this.fixture.detectChanges();
    }

    /**
     * Return ID of currently logged in user.
     */
    public getCurrentUser(): User {
        return this.currentUser;
    }

    /**
     * Create a specified model fake.
     */
    public fake(model: string, count: number = 1, data = {}) {
        return modelFactory.make(model, count, data);
    }

    /**
     * Hack for forcing change detection for ngChanges method.
     */
    public detectChangesHack() {
        this.fixture.changeDetectorRef['_view'].nodes[0].componentView.state |= (1 << 1);
        this.fixture.detectChanges();
    }

    private configureTestingModule(moduleConfig: Object) {
        TestBed.configureTestingModule(this.mergeModuleConfigs(moduleConfig));

        if (moduleConfig['entryComponents']) {
            TestBed.overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: moduleConfig['entryComponents'],
                },
            });
        }
    }

    private mergeModuleConfigs(moduleConfig: Object) {
        let merged = Object.assign({}, this.baseModuleConfig);

        for(let key in moduleConfig) {
            if (merged[key]) {
                merged[key] = merged[key].concat(moduleConfig[key]);
            } else {
                merged[key] = moduleConfig[key];
            }
        }

        return merged;
    }

    /**
     * Set current base url on settings service.
     */
    private setBaseUrl() {
        let pathArray = location.href.split('/'),
            protocol  = pathArray[0],
            host      = pathArray[2],
            url       = protocol + '//' + host;

        TestBed.get(SettingsService).set('base_url', url);
    }
}