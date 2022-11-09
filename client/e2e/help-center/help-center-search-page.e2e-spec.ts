import {browser, $, $$} from "protractor";

describe('Help Center Search Page', function() {
    const pageUrl = 'help-center/search/foo';

    it('should display articles matching search query', () => {
        browser.get(pageUrl);

        //renders all articles
        expect($$('.article').count()).toBeGreaterThan(2);

        //renders article title, body and path
        expect($$('.article .title').first().getText()).toBeNonEmptyString();
        expect($$('.article .body').first().getText()).toBeNonEmptyString();
        expect($$('.article .path').first().getText()).toBeNonEmptyString();

        //navigates to article page on article link click
        $$('.article .title').first().getText().then(text => {
            $$('.article .title').first().click();
            expect(browser.getCurrentUrl()).toMatch(/help-center\/articles\/[0-9]+/);
            expect($('.article-title').getText()).toEqual(text);
        });
    });

    it('should navigate to category on article path item click', () => {
        browser.get(pageUrl);

        $$('.article .path a').first().getText().then(text => {
            $$('.article .path a').first().click();
            expect(browser.getCurrentUrl()).toMatch(/help-center\/categories\/[0-9]+/);
            expect($('h1').getText()).toEqual(text);
        })
    });

    it('navigates back to help center home page', () => {
        browser.get(pageUrl);
        $('.back').click();
        expect(browser.getCurrentUrl()).toMatch(/help-center$/);
    });
});
