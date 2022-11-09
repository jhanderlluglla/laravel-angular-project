import {browser, $, $$} from "protractor";
import {helpers} from "../helpers.e2e";

describe('Articles List Page', function() {
    const pageUrl = 'help-center/manage/articles';

    beforeEach(() => {
        browser.get(pageUrl);
    });

    it('should display articles list', () => {
        expect($$('.articles-list-item').count()).toBeGreaterThan(2);
        expect($$('.article-categories').first().getText()).toBeNonEmptyString();
        expect($$('.article-title').first().getText()).toBeNonEmptyString();
        expect($$('.article-body').first().getText()).toBeNonEmptyString();
    });

    it('should filter articles by categories', () => {
        $$('.articles-list-item').count().then(oldCount => {
            $$('categories-manager .child-category').first().click();

            //selects checkboxes of child and parent categories
            expect($$('categories-manager .parent-category input').first().isSelected()).toBeTruthy();
            expect($$('categories-manager .child-category input').first().isSelected()).toBeTruthy();

            //filters articles list
            expect($$('.articles-list-item').count()).toBeLessThan(oldCount);
            expect($$('.articles-list-item').count()).toBeTruthy();

            //filters articles list to correct category
            $$('categories-manager .child-category').first().getText().then(categoryName => {
                $$('.article-categories').each(categories => {
                    expect(categories.getText()).toContain(categoryName);
                });
            });

            //clear all categories filters
            $('categories-manager .clear-all-button').click();
            expect($$('.articles-list-item').count()).toEqual(oldCount);
            expect($$('categories-manager .parent-category input').first().isSelected()).toBeFalsy();
            expect($$('categories-manager .child-category input').first().isSelected()).toBeFalsy();
        });
    });

    it('should filter articles by tags', () => {
        $$('.articles-list-item').count().then(oldCount => {
            $$('tags-manager .existing-tags .tag-name').first().click();

            //filters articles list
            expect($$('.articles-list-item').count()).toBeLessThan(oldCount);
            expect($$('.articles-list-item').count()).toBeTruthy();

            //filters articles list to correct tags
            $$('tags-manager .existing-tags .tag-name').first().getText().then(tagName => {
                $$('.article-tags').each(tags => {
                    tags.getText().then(text => {
                        expect(text.toLowerCase()).toContain(tagName);
                    });
                });
            });
        });
    });

    it('should filter articles by draft status', () => {
        //all articles filter is set by default
        expect($('.all-filter-button').getAttribute('class')).toContain('active');

        $$('.articles-list-item').count().then(oldCount => {
            $('.draft-filter-button').click();

            //filters articles by draft status
            expect($$('.articles-list-item').count()).toBeLessThan(oldCount);
            expect($$('.articles-list-item').count()).toBeTruthy();

            //filters articles list to drafts only
            $$('.articles-list-items').each(el => expect(el.getAttribute('class')).toContain('draft'));

            //filters articles list to non-drafts only
            $('.not-draft-filter-button').click();
            $$('.articles-list-items').each(el => expect(el.getAttribute('class')).not.toContain('draft'));
        });
    });

    it('should change article list layout, change articles order and filter articles by search query', () => {
        //changes articles list layout
        expect($('.articles-list').getAttribute('class')).toContain('grid');
        $('.list-layout-button').click();
        expect($('.articles-list').getAttribute('class')).toContain('list');

        //changes articles list order
        $$('.article-title').first().getText().then(title => {
            $$('#order option').first().click();
            expect($$('.article-title').first().getText()).not.toEqual(title);
        });

        //filters articles list by search query
        $$('.article-title').first().getText().then(title => {
            $('.articles-search-input').sendKeys(title);
            expect($$('.articles-list-item').count()).toEqual(1);
            expect($$('.article-title').first().getText()).toEqual(title);
        });
    });

    it('should delete article', () => {
        $$('.article-title').first().getText().then(title => {
            $$('.delete-article-button').first().click();
            helpers.confirmModalAction();
            $('.articles-search-input').sendKeys(title);
            expect($$('.articles-list-item').count()).toEqual(0);
        });
    });

    it('should navigate to create new article page', () => {
        expect(browser.getCurrentUrl()).toContain(pageUrl);
        $('.new-article-button').click();
        expect(browser.getCurrentUrl()).toContain('help-center/manage/articles/new');
    });
});
