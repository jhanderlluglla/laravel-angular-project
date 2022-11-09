import {Component, HostBinding, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {SettingsService} from "../settings.service";
import {Menu} from "../../admin/appearance/menus/menu";
import {MenuItem} from "../../admin/appearance/menus/menu-item";
import {CurrentUser} from "../../auth/current-user";
import {utils} from "../utils";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'custom-menu',
    templateUrl: './custom-menu.component.html',
    styleUrls: ['./custom-menu.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class CustomMenuComponent implements OnInit {
    @HostBinding('class.hidden') shouldHide: boolean = false;

    /**
     * Position in the app for this menu.
     */
    @Input() position: 'header|footer';

    /**
     * Menu that should be rendered.
     */
    public menu = new Menu();

    /**
     * Active component subscriptions.
     */
    public subscriptions: Subscription[] = [];

    /**
     * CustomMenuComponent Constructor.
     */
    constructor(
        private settings: SettingsService,
        private currentUser: CurrentUser,
    ) {}

    ngOnInit() {
        this.initMenu();

        //re-render if menu setting is changed
        let sub = this.settings.onChange.subscribe(name => {
           if (name === 'menus') this.initMenu();
        });

        this.subscriptions.push(sub);
    }

    /**
     * Convert specified string to snake_case.
     */
    public toSnakeCase(string: string) {
        return utils.toSnakeCase(string);
    }

    /**
     * Check if menu item should be displayed.
     */
    public shouldShow(item: MenuItem): boolean {
        switch (item.condition) {
            case 'auth':
                return this.currentUser.isLoggedIn();
            case 'guest':
                return !this.currentUser.isLoggedIn();
            case 'admin':
                return this.currentUser.hasPermission('superAdmin');
            case  'agent':
                return this.currentUser.hasPermission('tickets.update');
            default:
                return true;
        }
    }

    /**
     * Initiate custom menu.
     */
    private initMenu() {
        let json = this.settings.get('menus');

        //get stored custom menus
        let menus = JSON.parse(json);
        if ( ! menus) return this.shouldHide = true;

        //find first menu for specified position
        let menuConfig = menus.find(menu => menu.position === this.position);
        if ( ! menuConfig) return this.shouldHide = true;

        this.menu = new Menu(menuConfig);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => {
            subscription && subscription.unsubscribe();
        });
    }
}
