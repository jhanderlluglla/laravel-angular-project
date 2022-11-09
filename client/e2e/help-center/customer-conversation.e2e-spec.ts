import {browser, $, $$} from "protractor";
import {helpers} from "../helpers.e2e";

describe('Customer Conversation Page', function() {
    const pageUrl = 'help-center/tickets/999';

    it('should display customer conversation', () => {
        browser.get(pageUrl);

        //renders ticket subject
        expect($$('.ticket-subject').first().getText()).toBeNonEmptyString();

        //renders first reply
        expect($$('.reply .reply-body').first().getText()).toBeNonEmptyString();

        //renders all replies
        expect($$('.reply').count()).toBeGreaterThan(1);

        //open text editor
        $('.actions .reply-button').click();

        //set status to open
        $('.editor-footer .status-dropdown').click();
        $('.editor-footer .status-dropdown .open').click();

        //create reply
        helpers.typeIntoTextEditor('reply content');
        $('.submit-button').click();

        //hides text editor
        expect($('.text-editor-container').isDisplayed()).toBeFalsy();

        //renders newly created reply
        expect($$('.reply .message-body').first().getText()).toEqual('reply content');
    });

    it('should load more replies via infinite scroll', () => {
        browser.get(pageUrl);

        //scroll to bottom of page
        browser.actions().mouseMove($('customer-footer')).perform();

        //hides loading screen
        expect($('loading-indicator .spinner').isPresent()).toBeFalsy();

        //loads more replies via infinite scroll
        expect($$('.reply').count()).toBeGreaterThan(12);

        //renders replies loaded via infinite scroll
        browser.actions().mouseMove($('customer-footer')).perform();
        expect($$('.reply .message-body').get(12).getText()).toBeNonEmptyString();
    });
});
