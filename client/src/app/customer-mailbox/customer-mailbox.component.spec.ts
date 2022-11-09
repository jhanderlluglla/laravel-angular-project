import {KarmaTest} from "../../../testing/karma-test";
import {CustomerMailboxComponent} from "./customer-mailbox.component";
import {HcCompactHeaderComponent} from "../help-center/front/hc-compact-header/hc-compact-header.component";
import {CustomerFooterComponent} from "../shared/customer-footer/customer-footer.component";
import {MailboxTagsService} from "../ticketing/mailbox-tags.service";
import {BreadCrumbsComponent} from "../help-center/front/breadcrumbs/breadcrumbs.component";
import {CustomerNavbarComponent} from "../shared/customer-navbar/customer-navbar.component";
import {LoggedInUserWidgetComponent} from "../shared/logged-in-user-widget/logged-in-user-widget.component";
import {SuggestedArticlesDropdownComponent} from "../help-center/front/suggested-articles-dropdown/suggested-articles-dropdown.component";
import {HcUrls} from "../help-center/shared/hc-urls.service";
import {HelpCenterService} from "../help-center/shared/help-center.service";
import {CustomMenuComponent} from "../shared/custom-menu/custom-menu.component";
import {AuthService} from "../auth/auth.service";

describe('CustomerMailboxComponent', () => {
    let testBed: KarmaTest<CustomerMailboxComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    CustomerMailboxComponent, HcCompactHeaderComponent, CustomerFooterComponent, BreadCrumbsComponent,
                    CustomerNavbarComponent, SuggestedArticlesDropdownComponent, LoggedInUserWidgetComponent, CustomMenuComponent,
                ],
                providers: [MailboxTagsService, HcUrls, HelpCenterService, AuthService],
            },
            component: CustomerMailboxComponent
        });
    });

    it('renders hc header and breadcrumbs', () => {
        testBed.fixture.detectChanges();

        //renders header component
        expect(testBed.getChildComponent(HcCompactHeaderComponent)).toBeTruthy();

        //renders breadcrumbs component
        expect(testBed.getChildComponent(BreadCrumbsComponent)).toBeTruthy();

        //passes item to breadcrumbs component
        expect(testBed.getChildComponent(BreadCrumbsComponent).resource).toEqual('Tickets');

        //sets resource type as "static" on breadcrumbs component
        expect(testBed.getChildComponent(BreadCrumbsComponent).resourceType).toEqual('static');
    });

    it('renders customer footer component', () => {
        expect(testBed.getChildComponent(CustomerFooterComponent)).toBeTruthy();
    });

    it('renders router outlet', () => {
        expect(testBed.find('router-outlet')).toBeTruthy();
    });
});