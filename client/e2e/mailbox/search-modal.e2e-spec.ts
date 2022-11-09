import {browser, $, $$} from "protractor";
import {helpers} from "../helpers.e2e";
import {TicketsList} from "./tickets-list.po";

describe('Agent Mailbox Search Modal', function() {
    const pageUrl = 'mailbox';

    beforeEach(() => {
        browser.get(pageUrl);
        openSearchModal();
    });

    it('should display list of tickets that matched search query', () => {
        //renders tickets list
        TicketsList.expectTicketsTobeRendered();

        //assigns ticket to agent
        TicketsList.selectFirstTwoTickets();
        TicketsList.assignSelectedTicketsToCurrentAgent();
        helpers.expectToastToBeVisible();
        TicketsList.expectTicketsToBeDeselectedAndToolbarClosed();

        //opens clicked ticket modal
        $$('agent-search-modal .ticket-subject').first().getText().then(subject => {
            $$('agent-search-modal .ticket-subject').first().click();
            expect($('conversation-modal').isDisplayed()).toBeTruthy();
            expect($('conversation-modal .ticket-subject').getText()).toEqual(subject);
        });
    });

    it('should display a list of users matching search query', () => {
        $('.users-menu-item').click();

        //displays users
        expect($$('.users-tab .user').count()).toBeGreaterThanOrEqualTo(2);
        expect($$('.user .title').first().getText()).toBeNonEmptyString();
        expect($$('.user .body').first().getText()).toBeNonEmptyString();
        expect($$('.user .avatar').first().isDisplayed()).toBeTruthy();

        //navigates to user details route
        $$('.user .body').first().getText().then(email => {
            $$('.users-tab .user').first().click();
            expect(browser.getCurrentUrl()).toMatch(/mailbox\/users\/[0-9]+$/);
            expect($('.user-info .email').getText()).toEqual(email);
        });

        expect($('agent-search-modal').isPresent()).toBeFalse();
    });

    it('should display a list of articles matching search query', () => {
        $('.articles-menu-item').click();

        //displays articles
        expect($$('.articles-tab .article').count()).toBeGreaterThanOrEqualTo(2);
        expect($$('.article .title').first().getText()).toBeNonEmptyString();
        expect($$('.article .body').first().getText()).toBeNonEmptyString();

        //navigates to article page
        $$('.article .title').first().getText().then(title => {
            $$('.articles-tab .article').first().click();
            expect(browser.getCurrentUrl()).toMatch(/help-center\/articles\/[0-9]+/);
            expect($('.article-title').getText()).toEqual(title);
        });
    });

    function openSearchModal() {
        $('ticket-search-dropdown input').sendKeys('foo');
        helpers.waitForElementToBeClickable($('ticket-search-dropdown .footer'));
        $('ticket-search-dropdown .footer').click();
    }
});
