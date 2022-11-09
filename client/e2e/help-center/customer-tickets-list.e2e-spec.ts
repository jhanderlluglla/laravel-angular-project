import {browser, $, $$} from "protractor";
import {helpers} from "../helpers.e2e";

describe('Customer Tickets List Page', function() {
    const pageUrl = 'help-center/tickets';

    beforeEach(() => {
        browser.get(pageUrl);
    });

    it('should display customer tickets', () => {
        //renders all tickets
        expect($$('.ticket').count()).toBeGreaterThan(1);

        //renders ticket subject
        expect($$('.ticket .subject').first().getText()).toBeNonEmptyString();

        //renders first reply
        expect($$('.ticket .ticket-body').first().getText()).toBeNonEmptyString();

        //renders date
        expect($$('.ticket .date').first().getText()).toBeNonEmptyString();

        //renders replies count
        expect($$('.ticket .replies_count').first().getText()).toContain('1');

        //navigates to next pagination page
        $$('.subject').first().getText().then(subject => {
            browser.actions().mouseMove($('.next-page-button')).perform();
            $('.next-page-button').click();
            expect($$('.ticket').count()).toBeGreaterThan(1);
            $$('.subject').each(subjectEl => {
                expect(subjectEl.getText()).not.toEqual(subject);
            });
            expect(browser.getCurrentUrl()).toContain('page=2');
        });
    });

    it('should navigate to conversation page on ticket click', () => {
        $$('.ticket .subject').first().getText().then(subject => {
            $$('.ticket').first().click();
            expect(browser.getCurrentUrl()).toMatch(/help-center\/tickets\/[0-9]+/);

            expect($('customer-conversation .ticket-subject').getText()).toEqual(subject);
            expect($$('customer-conversation .message-body').first().getText()).toBeNonEmptyString();
        });
    });
});
