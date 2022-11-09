import {browser, $, $$} from "protractor";

describe('Agent Mailbox Navbar', function() {
    const pageUrl = 'mailbox';

    beforeAll(() => {
        browser.get(pageUrl);
    });

    it('should display the logo', () => {
        expect($('.logo').isDisplayed()).toBeTruthy();
    });

    it('should search for tickets', () => {
        $('ticket-search-dropdown input').sendKeys('foo');
        expect($('ticket-search-dropdown .dropdown').isDisplayed()).toBeTrue();

        //displays matching tickets
        expect($$('.tickets-panel .result').count()).toBeGreaterThanOrEqualTo(2);
        expect($$('.tickets-panel .title').first().getText()).toBeNonEmptyString();
        expect($$('.tickets-panel .body').first().getText()).toBeNonEmptyString();

        //navigates to ticket page
        $$('.tickets-panel .result').first().click();
        expect(browser.getCurrentUrl()).toMatch(/ticket\/[0-9]+$/);
    });

    it('should search for users', () => {
        $('ticket-search-dropdown input').sendKeys('foo');

        //switch to users tab
        $('.users-item').click();

        //displays matching users
        expect($$('.users-panel .result').count()).toBeGreaterThanOrEqualTo(2);
        expect($$('.users-panel .title').first().getText()).toBeNonEmptyString();
        expect($$('.users-panel .body').first().getText()).toBeNonEmptyString();
        expect($$('.users-panel .avatar').first().isDisplayed()).toBeTruthy();

        //navigates to user page
        $$('.users-panel .result').first().click();
        expect(browser.getCurrentUrl()).toMatch(/users\/[0-9]+$/);

        //closes dropdown
        expect($('ticket-search-dropdown .dropdown-menu').isDisplayed()).toBeFalse();
    });

    it('should display logged in user dropdown', () => {
        //dropdown is hidden by default
        expect($('logged-in-user-widget .dropdown-menu').isDisplayed()).toBeFalsy();

        //opens dropdown
        $('logged-in-user-widget').click();
        expect($('logged-in-user-widget .dropdown-menu').isDisplayed()).toBeTruthy();

        //navigates to account settings page via dropdown item
        $('logged-in-user-widget .account-settings-link').click();
        expect(browser.getCurrentUrl()).toContain('account/settings');

        //closes dropdown
        expect($('logged-in-user-widget .dropdown-menu').isDisplayed()).toBeFalse();
    });
});
