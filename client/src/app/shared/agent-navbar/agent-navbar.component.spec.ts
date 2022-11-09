import {KarmaTest} from "../../../../testing/karma-test";
import {AgentNavbarComponent} from "./agent-navbar.component";
import {TicketSearchDropdownComponent} from "../ticket-search-dropdown/ticket-search-dropdown.component";
import {LoggedInUserWidgetComponent} from "../logged-in-user-widget/logged-in-user-widget.component";
import {SettingsService} from "../settings.service";
import {CurrentUser} from "../../auth/current-user";
import {AuthService} from "../../auth/auth.service";

describe('AgentNavbar', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    AgentNavbarComponent, TicketSearchDropdownComponent, LoggedInUserWidgetComponent
                ],
                providers: [AuthService]
            },
            component: AgentNavbarComponent
        });
    });

    it('renders text or image logo', () => {
        let logoUrl = 'assets/images/empty.png';

        testBed.get(SettingsService).set('branding.hc_logo', logoUrl);
        testBed.fixture.detectChanges();

        //renders image logo
        expect(testBed.find('.logo')['src']).toContain(logoUrl);
        expect(testBed.find('.text-logo')).toBeFalsy();

        //renders text logo
        testBed.get(SettingsService).set('branding.hc_logo', null);
        testBed.get(SettingsService).set('branding.site_name', 'foo bar');
        testBed.fixture.detectChanges();
        expect(testBed.find('.logo')).toBeFalsy();
        expect(testBed.find('.text-logo').textContent.trim()).toEqual('foo bar');

        //renders only image logo if both text and image logo are available
        testBed.get(SettingsService).set('branding.hc_logo', logoUrl);
        testBed.get(SettingsService).set('branding.site_name', 'foo bar');
        testBed.fixture.detectChanges();
        expect(testBed.find('.logo')['src']).toContain(logoUrl);
        expect(testBed.find('.text-logo')).toBeFalsy();
    });

    it('renders navigation buttons', () => {
        testBed.fixture.detectChanges();

        //hides admin area link if not logged in as agent
        expect(testBed.find('.admin-link')).toBeFalsy();

        //shows admin area link if logged user has correct permissions
        spyOn(testBed.get(CurrentUser), 'hasPermission').and.returnValue(true);
        testBed.fixture.detectChanges();
        expect(testBed.find('.admin-link')).toBeTruthy();

        let links = testBed.findAll('.nav-item > a');

        //renders all links
        expect(links.length).toEqual(3);

        //renders mailbox link
        expect(links[0]['href']).toContain('mailbox');
        expect(links[0].getAttribute('routerLinkActive')).toEqual('router-link-active');

        //renders help center link
        expect(links[1]['href']).toContain('help-center/manage');
        expect(links[1].getAttribute('routerLinkActive')).toEqual('router-link-active');

        //renders admin area link
        expect(links[2]['href']).toContain('admin');
        expect(links[2].getAttribute('routerLinkActive')).toEqual('router-link-active');
    });

    it('renders ticket search component', () => {
        expect(testBed.getChildComponent(TicketSearchDropdownComponent)).toBeTruthy();
    });

    it('renders logged in user widget component', () => {
        expect(testBed.getChildComponent(LoggedInUserWidgetComponent)).toBeTruthy();
    });
});