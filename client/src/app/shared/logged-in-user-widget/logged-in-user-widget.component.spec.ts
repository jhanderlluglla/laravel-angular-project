import {KarmaTest} from "../../../../testing/karma-test";
import {CurrentUser} from "../../auth/current-user";
import {User} from "../models/User";
import {LoggedInUserWidgetComponent} from "./logged-in-user-widget.component";
import {AuthService} from "../../auth/auth.service";

describe('LoggedInUserWidget', () => {

    let testBed: KarmaTest<any>;
    let user: User;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [LoggedInUserWidgetComponent],
                providers: [AuthService]
            },
            component: LoggedInUserWidgetComponent
        });

        user = testBed.fake('User');
    });

    it('hides widget if user is not logged in', () => {
        testBed.fixture.detectChanges();
        expect(testBed.find('.dropdown-trigger')).toBeFalsy();
    });

    it('renders logged in user avatar and email', () => {
        testBed.get(CurrentUser).assignCurrent(user);
        testBed.fixture.detectChanges();

        //renders avatar
        expect(testBed.find('.avatar img')['src']).toContain(user.avatar);

        //renders email
        expect(testBed.find('.email').textContent.trim()).toEqual(user.email);
    });

    it('renders admin area link', () => {
        testBed.get(CurrentUser).assignCurrent(user);
        testBed.fixture.detectChanges();

        //admin area link is hidden if not logged in as admin
        expect(testBed.find('.admin-link')).toBeFalsy();

        //admin area link is visible if user has correct permissions
        spyOn(testBed.get(CurrentUser), 'hasPermission').and.returnValue(true);
        testBed.fixture.detectChanges();
        expect(testBed.find('.admin-link')).toBeTruthy();
    });

    it('renders agent mailbox link', () => {
        testBed.get(CurrentUser).assignCurrent(user);
        testBed.fixture.detectChanges();

        //agent mailbox link is hidden if not logged in as agent
        expect(testBed.find('.agent-mailbox-link')).toBeFalsy();

        //agent mailbox link is visible if logged in as agent
        spyOn(testBed.get(CurrentUser), 'hasPermission').and.returnValue(true);
        testBed.fixture.detectChanges();
        expect(testBed.find('.agent-mailbox-link')).toBeTruthy();
    });

    it('logs user out', () => {
        testBed.get(CurrentUser).assignCurrent(user);
        testBed.fixture.detectChanges();
        spyOn(testBed.get(AuthService), 'logOut');

        testBed.find('.logout-item').click();

        expect(testBed.get(AuthService).logOut).toHaveBeenCalledTimes(1);
    });
});