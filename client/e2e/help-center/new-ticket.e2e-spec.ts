import {browser, $, $$} from "protractor";
import {helpers} from "../helpers.e2e";

describe('New Ticket Page', function() {
    const pageUrl = 'help-center/tickets/new';

    it('should create a new ticket', () => {
        browser.get(pageUrl);

        //select ticket category
        $$('#category-select option').first().click();

        //enter subject
        $('suggested-articles-drawer .search-input').sendKeys('ticket subject');

        //enter ticket body into text editor
        helpers.typeIntoTextEditor('ticket body');

        //navigates to customer tickets route
        $('.submit-button').click();
        expect(browser.getCurrentUrl()).toContain('help-center/tickets');

        //renders newly created ticket
        expect($$('.ticket .subject').first().getText()).toEqual('ticket subject');
        expect($$('.ticket .ticket-body').first().getText()).toEqual('ticket body');
        expect($$('.ticket .replies_count').first().getText()).toContain('1');
    });

    it('shows article suggestions when user types into subject field', () => {
        browser.get(pageUrl);

        //enter ticket subject
        $('suggested-articles-drawer .search-input').sendKeys('foo');

        //finds and renders at least one article
        expect($$('suggested-articles-drawer .result').count()).toBeGreaterThan(1);

        //click article result
        let result = $$('suggested-articles-drawer .result').first();
        helpers.waitForElementToBeClickable(result);
        result.click();

        //opens article modal on article result click
        expect($('article-modal .article-title').getText()).toEqual(result.getText());
        expect($('article-modal .article-body').getText()).toBeNonEmptyString();
    });
});
