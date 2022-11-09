import {KarmaTest} from "../../../../../testing/karma-test";
import {SuggestedArticlesDropdownComponent} from "../suggested-articles-dropdown/suggested-articles-dropdown.component";
import {CustomerNavbarComponent} from "../../../shared/customer-navbar/customer-navbar.component";
import {LoggedInUserWidgetComponent} from "../../../shared/logged-in-user-widget/logged-in-user-widget.component";
import {HelpCenterService} from "../../shared/help-center.service";
import {HcUrls} from "../../shared/hc-urls.service";
import {HcHeaderComponent} from "./hc-header.component";
import {CustomMenuComponent} from "../../../shared/custom-menu/custom-menu.component";
import {AuthService} from "../../../auth/auth.service";

describe('HcHeaderComponent', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [HcHeaderComponent, SuggestedArticlesDropdownComponent, CustomerNavbarComponent, LoggedInUserWidgetComponent, CustomMenuComponent],
                providers: [HelpCenterService, HcUrls, AuthService],
            },
            component: HcHeaderComponent
        });
    });

    it('renders customer navbar', () => {
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(CustomerNavbarComponent)).toBeTruthy();
    });

    it('renders suggested articles dropdown component', () => {
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(SuggestedArticlesDropdownComponent)).toBeTruthy();
        expect(testBed.getChildComponent(SuggestedArticlesDropdownComponent).placeholder).toEqual(jasmine.any(String));
    });
});