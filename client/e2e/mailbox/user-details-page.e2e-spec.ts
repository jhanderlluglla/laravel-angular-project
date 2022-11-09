import {browser, $, $$, protractor} from "protractor";
import {helpers} from "../helpers.e2e";
import {TicketsList} from "./tickets-list.po";

describe('User Details Page', function() {
    const pageUrl = 'mailbox/users/1';

    beforeAll(() => {
        browser.get(pageUrl);
    });

    it('should display user details', () => {
        expect($$('.user-info .name').first().getText()).toBeNonEmptyString();
        expect($$('.user-info .email').first().getText()).toBeNonEmptyString();
        expect($$('.user-avatar').first().isDisplayed()).toBeTruthy();
    });

    it('should change details and notes about user', () => {
        $('#details').sendKeys('foo details');
        $('#notes').sendKeys('foo notes');
        helpers.expectToastToBeVisible();
    });

    it('should add secondary emails to user', () => {
        $('.add-email-button').click();
        $('email-address-modal #email').sendKeys('foo@foo.com');
        helpers.confirmModalAction();
        expect($('.emails .secondary-email').getText()).toEqual('foo@foo.com');
    });

    it('should add tags to user', () => {
        //add tags to user
        $('.tags-string-model').sendKeys('foo_bar_baz');
        $('.add-tags-button').click();
        $$('.existing-tags .tag-name').first().click();

        //added tags to user
        $$('.existing-tags .tag-name').first().getText().then(tagName => {
            expect($$('.selected-tags .tag').count()).toEqual(2);
            expect($$('.selected-tags .tag-name').get(0).getText()).toEqual('foo_bar_baz');
            expect($$('.selected-tags .tag-name').get(1).getText()).toEqual(tagName);
        });
    });

    it('should modify user groups', () => {
        $('.select-groups-modal-button').click();

        protractor.promise.all([
            $$('select-groups-modal label').get(1).getText(),
            $$('user-access-manager .group').count() as any,
        ]).then(oldValues => {
            //add group to user
            $$('select-groups-modal label').get(1).click();
            helpers.confirmModalAction();

            //added group to user
            expect($$('user-access-manager .group').last().getText()).toEqual(oldValues[0]);
            expect($$('user-access-manager .group').count()).toBeGreaterThan(oldValues[1]);

            //removes group
            $$('.detach-group-button').last().click();
            expect($$('user-access-manager .group').count()).toEqual(oldValues[1]);
        });
    });

    it('should modify user permissions', () => {
        $('.select-permissions-modal-button').click();

        protractor.promise.all([
            $$('select-permissions-modal label').get(1).getText(),
            $$('user-access-manager .permission').count() as any,
        ]).then(oldValues => {
            //add permission to user
            $$('select-permissions-modal label').get(1).click();
            helpers.confirmModalAction();

            //added permission to user
            expect($$('user-access-manager .permission').last().getText()).toEqual(oldValues[0].toLowerCase());
            expect($$('user-access-manager .permission').count()).toBeGreaterThan(oldValues[1]);

            //removes permission
            $$('.remove-permission-button').last().click();
            expect($$('user-access-manager .permission').count()).toEqual(oldValues[1]);
        });
    });

    it('should display a list of user tickets', () => {
        //renders tickets list
        TicketsList.expectTicketsTobeRendered();

        //assigns ticket to agent
        TicketsList.selectFirstTwoTickets();
        TicketsList.assignSelectedTicketsToCurrentAgent();
        helpers.expectToastToBeVisible();
        TicketsList.expectTicketsToBeDeselectedAndToolbarClosed();

        //opens clicked ticket modal
        $$('.ticket-subject').first().getText().then(subject => {
            $$('.ticket-subject').first().click();
            expect($('conversation-modal').isDisplayed()).toBeTruthy();
            expect($('conversation-modal .ticket-subject').getText()).toEqual(subject);
            helpers.closeModal();
        });
    });

    it('should paginate tickets list', () => {
        //changes "per_page" setting
        $$('.ticket').count().then(oldCount => {
            $$('#per-page option').first().click();
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
        });
    });
});
