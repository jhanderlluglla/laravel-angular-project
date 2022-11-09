import {KarmaTest} from "../../../../../testing/karma-test";
import {HcCompactHeaderComponent} from "./hc-compact-header.component";
import {SuggestedArticlesDropdownComponent} from "../suggested-articles-dropdown/suggested-articles-dropdown.component";
import {CustomerNavbarComponent} from "../../../shared/customer-navbar/customer-navbar.component";
import {LoggedInUserWidgetComponent} from "../../../shared/logged-in-user-widget/logged-in-user-widget.component";
import {HelpCenterService} from "../../shared/help-center.service";
import {HcUrls} from "../../shared/hc-urls.service";
import {Component} from "@angular/core";
import {CustomMenuComponent} from "../../../shared/custom-menu/custom-menu.component";
import {AuthService} from "../../../auth/auth.service";

describe('HcCompactHeaderComponent', () => {
    let testBed: KarmaTest<any>;

    @Component({
        selector: 'compact-header-host',
        template: '<hc-compact-header><div class="projected">projected content</div></hc-compact-header>',
    })
    class CompactHeaderHostComponent {}

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [CompactHeaderHostComponent, HcCompactHeaderComponent, SuggestedArticlesDropdownComponent, CustomerNavbarComponent, LoggedInUserWidgetComponent, CustomMenuComponent, CustomMenuComponent],
                providers: [HelpCenterService, HcUrls, AuthService],
            },
            component: CompactHeaderHostComponent
        });
    });

    it('renders customer navbar', () => {
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(CustomerNavbarComponent)).toBeTruthy();
    });

    it('renders projected ng content properly', () => {
        testBed.fixture.detectChanges();
        expect(testBed.find('hc-compact-header .projected').textContent).toEqual('projected content');
    });

    it('renders suggested articles dropdown component', () => {
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(SuggestedArticlesDropdownComponent)).toBeTruthy();
        expect(testBed.getChildComponent(SuggestedArticlesDropdownComponent).placeholder).toEqual(jasmine.any(String));
    });
});