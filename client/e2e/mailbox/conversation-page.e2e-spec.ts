import {browser, $, $$, protractor} from "protractor";
import {helpers} from "../helpers.e2e";

describe('Conversation Page', function() {
    const pageUrl = 'mailbox/tickets/tag/1/ticket/999';

    beforeAll(() => {
        browser.get(pageUrl);
    });

    it('should display conversation', () => {
        //renders ticket subject
        expect($('.ticket-subject').getText()).toBeNonEmptyString();

        //renders first reply
        expect($$('.reply .reply-body').first().getText()).toBeNonEmptyString();
        expect($$('.reply .user-avatar').isDisplayed()).toBeTruthy();

        //renders all replies
        expect($$('.reply').count()).toBeGreaterThan(1);
    });

    it('should assign ticket to selected agent', () => {
        $('assign-ticket-dropdown').click();
        $('assign-ticket-dropdown .me-item').click();

        //shows toast
        helpers.expectToastToBeVisible();

        //protractor doesn't wait for counter to update, need to do it manually
        helpers.waitForElementToBeVisible($('.status-tag .mine .tickets-count'));

        //updates mailbox ticket counts
        $('.status-tag .mine .tickets-count').getText().then(count => {
            expect(parseInt(count)).toBeGreaterThan(0);
        });

        //closes dropdown
        expect($('assign-ticket-dropdown .dropdown-menu').isDisplayed()).toBeFalse();
    });

    it('should add a note to ticket', () => {
        $('.add-note-button').click();
        helpers.typeIntoTextEditor('note body', 'add-note-modal');
        helpers.confirmModalAction();

        expect($$('.reply').first().getAttribute('class')).toContain('notes');
        expect($$('.reply .message-body').first().getText()).toEqual('note body');
    });

    it('should add a tag to ticket', () => {
        $('add-tag-dropdown').click();
        $('.tag-search-input').sendKeys('foo');

        protractor.promise.all([
            $$('add-tag-dropdown .dropdown-item').first().getText(),
            $$('.category-tag .tickets-count').first().getText(),
        ]).then(oldValues => {
            $$('add-tag-dropdown .dropdown-item').first().click();

            //adds tag to ticket
            expect(oldValues[0]).toBeNonEmptyString();
            expect($$('.tags .tag-label').first().getText()).toContain(oldValues[0]);

            //increments category tag tickets count
            $$('.category-tag .tickets-count').first().getText().then(count => {
                expect(parseInt(count)).toBeGreaterThan(parseInt(oldValues[1]) || 0);
            });

            //shows toast
            helpers.expectToastToBeVisible();

            //closes dropdown
            expect($('assign-ticket-dropdown .dropdown-menu').isDisplayed()).toBeFalse();
        });
    });

    it('should remove tag from ticket', () => {
        protractor.promise.all([
            $$('.tags .tag-label').count() as any,
            $$('.tags .tag-name').first().getText(),
        ]).then(oldValues => {
            $$('.tags .remove-tag-button').first().click();
            expect($$('.tags .tag-label').count()).toBeLessThan(oldValues[0]);
            $$('.tags .tag-name').each(tagName => {
                expect(tagName.getText()).not.toEqual(oldValues[1]);
            })
        });
    });

    it('should change ticket status', () => {
        expect($('.ticket-status').getText()).toContain('OPEN');

        $('.status-tag .open .tickets-count').getText().then(oldCount => {
            //change ticket status to closed
            $('.ticket-status-dropdown-container').click();
            $('.ticket-status-dropdown-container .closed').click();

            //protractor doesn't wait for counter to update, need to do it manually
            helpers.waitForTextToChange($('.status-tag .open .tickets-count'), oldCount);

            //updates mailbox ticket counts
            $('.status-tag .open .tickets-count').getText().then(count => {
                expect(parseInt(count)).toBeLessThan(parseInt(oldCount));
            });

            //changes ticket status
            expect($('.ticket-status').getText()).toEqual('CLOSED');

            //closes dropdown
            expect($('.ticket-status-dropdown-container .dropdown-menu').isDisplayed()).toBeFalse();
        });
    });

    it('should add a new reply', () => {
        //add reply body
        $('.reply-button').click();
        helpers.typeIntoTextEditor('reply body');

        //set status to pending
        $('.editor-footer .status-dropdown').click();
        $('.editor-footer .status-dropdown .pending').click();

        //submit reply
        $('.submit-button').click();

        expect($$('.reply').first().getAttribute('class')).toContain('replies');
        expect($$('.reply .message-body').first().getText()).toEqual('reply body');
        expect($('.text-editor-container').isDisplayed()).toBeFalsy();
        expect($('.ticket-status').getText()).toEqual('PENDING');
    });

    it('should create and add a new canned reply', () => {
        //add some text
        $('.reply-button').click();
        helpers.typeIntoTextEditor('reply body ');

        //create canned reply
        $('canned-replies-dropdown').click();
        $('.new-canned-reply').click();
        $('#canned-reply-name').sendKeys('canned reply name');
        helpers.typeIntoTextEditor('canned reply body', 'crupdate-canned-reply-modal');
        helpers.confirmModalAction();

        //added new canned reply to dropdown
        $('canned-replies-dropdown').click();
        expect($$('canned-replies-dropdown .canned-reply').first().getText()).toEqual('canned reply name');

        //add canned reply
        $('canned-replies-dropdown .search-input').sendKeys('canned reply name');
        expect($$('.canned-reply').count()).toEqual(1);
        $$('.canned-reply').first().click();

        //create reply
        $('.submit-button').click();

        expect($$('.reply').first().getAttribute('class')).toContain('replies');
        expect($$('.reply .message-body').first().getText()).toEqual('reply body canned reply body');
    });

    it('should create a reply draft', () => {
        //creates draft
        $('.reply-button').click();
        helpers.typeIntoTextEditor('draft body');
        $('.save-draft-button').click();
        expect($$('.reply').first().getAttribute('class')).toContain('drafts');
        expect($$('.reply .message-body').first().getText()).toEqual('draft body');

        //edits draft
        $$('.draft-actions .edit-draft-button').first().click();
        helpers.typeIntoTextEditor('edited draft body');
        $('.save-draft-button').click();
        expect($$('.reply').first().getAttribute('class')).toContain('drafts');
        expect($$('.reply.drafts').count()).toEqual(1);
        expect($$('.reply .message-body').first().getText()).toEqual('edited draft body');

        //deletes draft
        $$('.draft-actions .delete-draft-button').first().click();
        helpers.confirmModalAction();
        expect($$('.reply.drafts').count()).toEqual(0);
    });

    it('should load more replies via infinite scroll', () => {
        $$('.reply').count().then(oldCount => {
            //scroll to bottom of page
            browser.actions().mouseMove($$('.reply').last()).perform();

            //hides loading screen
            expect($('loading-indicator .spinner').isPresent()).toBeFalsy();

            //loads more replies via infinite scroll
            expect($$('.reply').count()).toBeGreaterThan(oldCount);

            //renders replies loaded via infinite scroll
            browser.actions().mouseMove($$('.reply').last()).perform();
            expect($$('.reply .message-body').last().getText()).toBeNonEmptyString();
        });
    });

    it('should update existing reply', () => {
        $$('.reply.replies .reply-actions').first().click();
        $$('.reply.replies .reply-actions .update-reply-button').first().click();
        helpers.typeIntoTextEditor('updated body', 'update-reply-modal');
        helpers.confirmModalAction();
        expect($$('.reply.replies .message-body').first().getText()).toEqual('updated body');
    });

    it('should delete existing reply', () => {
        protractor.promise.all([
            $$('.reply.replies').count() as any,
            $$('.reply.replies .message-body').first().getText(),
        ]).then(oldValues => {
            $$('.reply.replies .reply-actions').first().click();
            $$('.reply.replies .reply-actions .delete-reply-button').first().click();
            helpers.confirmModalAction();
            helpers.expectToastToBeVisible();
            expect($$('.reply.replies').count()).toBeLessThan(oldValues[0]);
            $$('.reply.replies .message-body').each(bodyEl => {
                expect(bodyEl.getText()).not.toEqual(oldValues[1]);
            });
        });
    });

    it('should show original reply email', () => {
        $$('.reply.replies .reply-actions').first().click();
        $$('.reply.replies .reply-actions .show-original-reply-button').first().click();
        expect($('show-original-reply-modal .email-content').getText()).toBeNonEmptyString();
        helpers.confirmModalAction();
    });

    it('should display other tickets from user in sidebar', () => {
        //displays details about user
        expect($('conversation-sidebar img').isDisplayed()).toBeTruthy();
        expect($('conversation-sidebar .name').getText()).toBeNonEmptyString();
        expect($('conversation-sidebar .email').getText()).toBeNonEmptyString();

        //displays other user tickets
        expect($$('conversation-sidebar .ticket').count()).toBeGreaterThan(1);
        expect($$('conversation-sidebar .ticket').first().getText()).toBeNonEmptyString();

        //opens ticket in conversation modal
        $$('conversation-sidebar .ticket').first().getText().then(ticketSubject => {
            $$('conversation-sidebar .ticket').first().click();
            expect($('conversation-modal .ticket-subject').getText()).toEqual(ticketSubject);
            helpers.closeModal();
        });
    });

    it('should send a reply and open next active ticket', () => {
        protractor.promise.all([
            browser.getCurrentUrl(),
            $('.ticket-subject').getText(),
            $$('.message-body').first().getText(),
        ]).then(oldValues => {
            $('.reply-button').click();

            //set "after reply action" to "next active ticket"
            $('.submit-button-addon').click();
            $('.next-active-ticket').click();

            //send new reply
            helpers.typeIntoTextEditor('reply body');
            $('.submit-button').click();

            helpers.waitForTextToChange($('.ticket-subject'), oldValues[1]);

            expect(browser.getCurrentUrl()).not.toEqual(oldValues[0]);
            expect($('.ticket-subject').getText()).not.toEqual(oldValues[1]);
            expect($$('.message-body').first().getText()).not.toEqual(oldValues[2]);
        });
    });

    it('should send a reply and go back to tickets list', () => {
        browser.get(pageUrl);
        $('.reply-button').click();

        //set "after reply action" to "back_to_folder"
        $('.submit-button-addon').click();
        $('.back_to_folder').click();

        //send new reply
        helpers.typeIntoTextEditor('reply body');
        $('.submit-button').click();

        expect(browser.getCurrentUrl()).toMatch(/mailbox\/tickets\/tag\/1$/);
    });

    it('should navigate back to tickets list', () => {
        browser.get(pageUrl);
        $('.back-button').click();
        expect(browser.getCurrentUrl()).toContain('mailbox/tickets/tag/1');
    });
});
