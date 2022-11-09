import {browser, $, $$, protractor} from "protractor";
import {helpers} from "../helpers.e2e";
import {TicketsList} from "./tickets-list.po";

describe('Tickets List Page', function() {
    const pageUrl = 'mailbox/tickets';

    beforeAll(() => {
        browser.get(pageUrl);
    });

    it('should render a list of tickets', () => {
        TicketsList.expectTicketsTobeRendered();
    });

    it('should assign selected tickets to agent', () => {
        TicketsList.selectFirstTwoTickets();

        TicketsList.assignSelectedTicketsToCurrentAgent();

        //shows toast
        helpers.expectToastToBeVisible();

        //protractor doesn't wait for counter to update, need to do it manually
        helpers.waitForElementToBeVisible($('.status-tag .open .tickets-count'));

        //updates mailbox ticket counts
        $('.status-tag .mine .tickets-count').getText().then(count => {
            expect(parseInt(count)).toBeGreaterThan(0);
        });

        //deselects all tickets and closes floating toolbar
        TicketsList.expectTicketsToBeDeselectedAndToolbarClosed();
    });

    it('should change selected tickets status', () => {
        TicketsList.selectFirstTwoTickets();

        protractor.promise.all([
            $$('.ticket .ticket-subject').getText(),
            $('.status-tag .open .tickets-count').getText(),
        ]).then(oldValues => {
            //change ticket status to closed
            $('.change-status-dropdown').click();
            $('.change-status-dropdown .closed').click();

            //protractor doesn't wait for counter to update, need to do it manually
            helpers.waitForTextToChange($('.status-tag .open .tickets-count'), oldValues[1]);

            //updates mailbox ticket counts
            $('.status-tag .open .tickets-count').getText().then(count => {
                expect(parseInt(count)).toBeLessThan(parseInt(oldValues[1]));
            });

            //removes closed ticket from "open" tickets mailbox
            $$('.ticket-subject').each(subject => {
                expect(subject.getText()).not.toEqual(oldValues[0]);
            });
        });

        //deselects all tickets and closes floating toolbar
        TicketsList.expectTicketsToBeDeselectedAndToolbarClosed();
    });

    it('should add tag to selected tickets', () => {
        TicketsList.selectFirstTwoTickets();
        $('add-tag-dropdown').click();
        $('.tag-search-input').sendKeys('foo');

        protractor.promise.all([
            $$('add-tag-dropdown .dropdown-item').first().getText(),
            $$('.category-tag .tickets-count').first().getText(),
        ]).then(oldValues => {
            $$('add-tag-dropdown .dropdown-item').first().click();

            //adds tag to ticket
            expect(oldValues[0]).toBeNonEmptyString();
            expect($$('.ticket .tag-label').get(0).getText()).toEqual(oldValues[0]);
            expect($$('.ticket .tag-label').get(1).getText()).toEqual(oldValues[0]);

            //increments category tag tickets count
            $$('.category-tag .tickets-count').first().getText().then(count => {
                expect(parseInt(count)).toBeGreaterThan(parseInt(oldValues[1]) || 0);
            });

            //shows toast
            helpers.expectToastToBeVisible();

            //deselects all tickets and closes floating toolbar
            TicketsList.expectTicketsToBeDeselectedAndToolbarClosed();
        });
    });

    it('should delete selected tickets', () => {
        protractor.promise.all([
            $$('.ticket-subject').get(0).getText(),
            $$('.ticket-subject').get(1).getText(),
            $('.status-tag .open .tickets-count').getText(),
        ]).then(oldValues => {
            TicketsList.selectFirstTwoTickets();
            $('.delete-tickets-button').click();
            helpers.confirmModalAction();

            //deletes tickets
            $$('.ticket-subject').each(subject => {
                expect(subject.getText()).not.toEqual(oldValues[0]);
                expect(subject.getText()).not.toEqual(oldValues[1]);
            });

            //updates mailbox ticket counts
            $('.status-tag .open .tickets-count').getText().then(count => {
                expect(parseInt(count)).toBeLessThan(parseInt(oldValues[2]));
            });

            //shows toast
            helpers.expectToastToBeVisible();

            //deselects all tickets and closes floating toolbar
            TicketsList.expectTicketsToBeDeselectedAndToolbarClosed();
        });
    });

    it('should paginate tickets', () => {
        //changes "per_page" setting
        $$('.ticket').count().then(oldCount => {
            $$('#per-page option').first().click();
            expect(browser.getCurrentUrl()).toContain('per_page=5');
            expect($$('.ticket').count()).toBeLessThan(oldCount);
        });

        //navigates to next page
        $$('.ticket-subject').first().getText().then(subject => {
            browser.actions().mouseMove($('.next-page-button')).perform();
            $('.next-page-button').click();
            expect($$('.ticket').count()).toBeGreaterThan(1);
            $$('.ticket-subject').each(subjectEl => {
                expect(subjectEl.getText()).not.toEqual(subject);
            });
            expect(browser.getCurrentUrl()).toContain('page=2');
        });
    });

    it('should navigate to status, category and ticket routes', () => {
        browser.get(pageUrl);

        //navigates to "closed" tickets route
        $('.status-tag .closed').click();
        expect(browser.getCurrentUrl()).toContain(pageUrl+'/tag/2');
        expect($$('.ticket').count()).toBeGreaterThan(1);
        expect($$('.customer-name').get(1).getText()).toBeNonEmptyString();

        //navigates to "category" tickets route
        $$('.category-tag a').first().click();
        expect(browser.getCurrentUrl()).toContain(pageUrl+'/tag/5');
        expect($$('.ticket').count()).toBeGreaterThan(1);
        expect($$('.customer-name').get(1).getText()).toBeNonEmptyString();

        //navigates to "conversation" route
        $$('.ticket .ticket-subject').first().getText().then(title => {
            $$('.ticket .ticket-subject').first().click();
            expect(browser.getCurrentUrl()).toMatch(/ticket\/[0-9]+/);
            expect($('.ticket-subject').getText()).toEqual(title);
        });
    });
});
