import {browser, $, $$} from "protractor";

describe('Help Center Article Page', function() {
    const pageUrl = 'help-center/articles/1/foo';

    it('should display article', () => {
        browser.get(pageUrl);

        //renders article title and body
        expect($('.article-title').getText()).toBeNonEmptyString();
        expect($('.article-body').getText()).toBeNonEmptyString();

        //marks article as helpful/not helpful
        $('.feedback-buttons .yes').click();
        expect($('feedback-buttons').isPresent()).toBeFalsy();
        expect($('.feedback-submitted-notification').getText()).toBeNonEmptyString();

        //it navigates to new ticket page
        $('.submit-ticket-container a').click();
        expect(browser.getCurrentUrl()).toContain('help-center/tickets/new');
    });

    it('should display related articles', () => {
        browser.get(pageUrl);

        //renders related articles
        expect($$('.related-content .item').count()).toBeGreaterThan(1);
        expect($$('.related-content .related-item-title').first().getText()).toBeNonEmptyString();

        //navigates to article page
        $$('.related-content .related-item-title').get(1).getText().then(text => {
            $$('.related-content .related-item-title').get(1).click();
            expect(browser.getCurrentUrl()).toContain('help-center/articles/2');
            expect($('.article-title').getText()).toEqual(text);
        });
    });

    it('should display help center header', () => {
        browser.get(pageUrl);

        //searches for articles
        $('suggested-articles-dropdown input').sendKeys('foo');
        expect($('suggested-articles-dropdown dropdown').isDisplayed()).toBeTruthy();
        expect($$('suggested-articles-dropdown .result').count()).toBeGreaterThan(2);

        //renders article path
        expect($$('breadcrumbs .item').count()).toEqual(4);
        expect($$('breadcrumbs .item').first().getText()).toBeNonEmptyString();

        //navigates to category page on breadcrumb item click
        $$('breadcrumbs .item').get(1).getText().then(text => {
            $$('breadcrumbs .item').get(1).click();
            expect(browser.getCurrentUrl()).toContain('help-center/categories/1');
            expect($('.title h1').getText()).toEqual(text);
        });
    })
});
