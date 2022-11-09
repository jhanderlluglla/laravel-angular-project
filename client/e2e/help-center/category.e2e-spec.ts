import {browser, $, $$} from "protractor";

describe('Category Page', function() {
    const pageUrl = 'help-center/categories/3/foo';

    it('should display a list of category articles', () => {
        browser.get(pageUrl);

        //renders category title
        expect($('h1').getText()).toBeNonEmptyString();

        //renders all articles
        expect($$('.article').count()).toBeGreaterThan(1);

        //renders article title and body
        expect($$('.article .title').first().getText()).toBeNonEmptyString();
        expect($$('.article .body').first().getText()).toBeNonEmptyString();

        //changes article list order
        $$('.article .title').first().getText().then(oldTitle => {
            $$('#order option').first().click();
            expect($$('.article .title').first().getText()).not.toEqual(oldTitle);
        });

        //navigates to article page
        $$('.article .title').first().getText().then(oldTitle => {
            $$('.article').first().click();
            expect(browser.getCurrentUrl()).toMatch(/help-center\/articles\/[0-9]+/);
            expect($('h1').getText()).toEqual(oldTitle);
        });
    });

    it('should display a list of related categories', () => {
        browser.get(pageUrl);

        //renders all categories
        expect($$('.categories-list .category').count()).toBeGreaterThan(1);

        //renders category name
        expect($$('.categories-list .category-name').first().getText()).toBeNonEmptyString();

        //navigates to category page
        $$('.categories-list .category-name').get(1).getText().then(name => {
            $$('.categories-list .category').get(1).click();
            expect(browser.getCurrentUrl()).toContain('help-center/categories/4');
            expect($('h1').getText()).toEqual(name);
        });
    });

    it('should display help center header', () => {
        browser.get(pageUrl);

        //searches for articles
        $('suggested-articles-dropdown input').sendKeys('foo');
        expect($('suggested-articles-dropdown dropdown').isDisplayed()).toBeTruthy();
        expect($$('suggested-articles-dropdown .result').count()).toBeGreaterThan(2);

        //renders category path
        expect($$('breadcrumbs .item').count()).toEqual(3);
        expect($$('breadcrumbs .item').first().getText()).toBeNonEmptyString();

        //navigates to parent category page on breadcrumb item click
        $$('breadcrumbs .item').get(1).getText().then(text => {
            $$('breadcrumbs .item').get(1).click();
            expect(browser.getCurrentUrl()).toContain('help-center/categories/1');
            expect($('.title h1').getText()).toEqual(text);
        });
    })
});
