import {browser, $, $$} from "protractor";

describe('Help Center Homepage', function() {
    const pageUrl = 'help-center';

    it('should display customer navbar', () => {
        browser.get(pageUrl);

        //renders logo
        expect($('.logo').isDisplayed()).toBeTruthy();

        //dropdown is hidden by default
        expect($('logged-in-user-widget .dropdown-menu').isDisplayed()).toBeFalsy();

        //opens dropdown
        $('logged-in-user-widget').click();
        expect($('logged-in-user-widget .dropdown-menu').isDisplayed()).toBeTruthy();

        //navigates to customer tickets list via dropdown item
        $$('logged-in-user-widget .dropdown-item').first().click();
        expect(browser.getCurrentUrl()).toContain('admin');
    });

    it('should display categories and articles', () => {
        browser.get(pageUrl);

        //renders all parent categories
        expect($$('.category').count()).toBeGreaterThan(1);

        //renders parent category name
        expect($$('.category .category-name').first().getText()).toBeNonEmptyString();

        //renders all child categories
        expect($$('.category .child-category').count()).toBeGreaterThan(2);

        //renders articles
        expect($$('.category .article').count()).toBeGreaterThan(3);

        $$('.category .article').first().getText().then(text => {
            expect(text.length).toBeTruthy();

            //navigates to article page on article link click
            $$('.category .article').first().click();
            expect(browser.getCurrentUrl()).toContain('help-center/articles/1');
            expect($('.article-title').getText()).toEqual(text);
        });
    });

    it('should search for articles', () => {
        browser.get(pageUrl);

        $('suggested-articles-dropdown input').sendKeys('foo');

        //shows article suggestions dropdown
        expect($('suggested-articles-dropdown dropdown').isDisplayed()).toBeTruthy();

        //renders all results
        expect($$('suggested-articles-dropdown .result').count()).toBeGreaterThan(2);

        //renders article body, title, category
        expect($$('suggested-articles-dropdown .title').first().getText()).toBeNonEmptyString();
        expect($$('suggested-articles-dropdown .body').first().getText()).toBeNonEmptyString();
        expect($$('suggested-articles-dropdown .category').first().getText()).toBeNonEmptyString();

        //navigates to article page on article link click
        $$('suggested-articles-dropdown .title').first().getText().then(text => {
            $$('suggested-articles-dropdown .result').first().click();
            expect(browser.getCurrentUrl()).toContain('help-center/articles/1');
            expect($('.article-title').getText()).toEqual(text);
        });
    });

    it('navigates to article search page', () => {
        browser.get(pageUrl);

        $('suggested-articles-dropdown input').sendKeys('foo');
        $('suggested-articles-dropdown .see-all').click();

        expect(browser.getCurrentUrl()).toContain('help-center/search/foo');
        expect($('.header .info').getText()).toContain('foo');
    });
});
