import {browser, $, $$} from "protractor";
import {helpers} from "../helpers.e2e";
import * as Faker from 'faker';

describe('New Articles Page', function() {
    const pageUrl = 'help-center/manage/articles/new';

    beforeAll(() => {
        browser.get(pageUrl);
    });

    it('should update article settings', () => {
        updateArticleSettings();
        $('.article-settings-action').click();
        expect($('#article-slug').getAttribute('value')).toEqual('slug');
        expect($('#article-description').getAttribute('value')).toEqual('description');
        expect($('#article-position').getAttribute('value')).toEqual('15');
        helpers.closeModal();
    });

    it('should show article preview', () => {
        updateArticleBodyAndTitle();
        $('.preview-article-button').click();
        expect($('article-modal .article-title').getText()).toContain('article title');
        expect($('article-modal .article-body').getText()).toContain('article body');
        helpers.closeModal();
    });

    it('should allow editing article via wysiwyg editor', () => {
        let img = Faker.image.avatar();

        //add text via visual mode
        helpers.typeIntoTextEditor('foo visual');

        //add text via source mode
        $('.source-mode-button').click();
        $('.source-textarea').sendKeys(' foo source ');

        $('.visual-mode-button').click();

        //add inline image
        $('.image-modal-button').click();
        $('.link-tab-button').click();
        $('#image-link').sendKeys(img);
        helpers.confirmModalAction();

        //format text
        $('.format-button').click();
        $$('.format-menu .dropdown-item').first().click();

        //change text color
        $('.color-button').click();
        $$('.color-menu .dropdown-item').click();
        browser.switchTo().activeElement().click();
        browser.switchTo().defaultContent();

        //insert "important" widget
        $('.insert-button').click();
        $('.important-item').click();

        $('.preview-article-button').click();
        let html = $('article-modal .article-body').getAttribute('innerHTML');
        expect(html).toContain('foo source');
        expect(html).toContain('<h1>foo visual</h1>');
        expect(html).toContain('<div class="title">Important:</div>');
        //expect(html).toContain('<img src="'+img+'"> ');
        helpers.closeModal();
    });

    it('should create a new category', () => {
        $('.new-category-button .button').click();
        $('#name').sendKeys('new category');
        helpers.confirmModalAction();
        expect($$('categories-manager .category').first().getText()).toEqual('new category');
    });

    it('should create a new article', () => {
        updateArticleBodyAndTitle();
        addCategoryAndTagToArticle();
        updateArticleSettings();
        $('.publish-article-button').click();

        helpers.expectToastToBeVisible();

        //creates article
        $$('categories-manager .parent-category').get(1).getText().then(text => {
            browser.get('help-center/manage/articles');
            $('.articles-search-input').sendKeys('article title');
            expect($$('.articles-list-item').count()).toEqual(1);
            expect($$('.article-title').first().getText()).toEqual('article title');
            expect($$('.article-categories').first().getText()).toEqual(text);
            expect($$('.article-tags').first().getText()).toEqual('TAG');
        });
    });

    it('should update article', () => {
        browser.get(pageUrl);

        //create article
        updateArticleBodyAndTitle();
        addCategoryAndTagToArticle();
        $('.publish-article-button').click();

        //update article
        $('.article-title-input').sendKeys(' updated');
        $('.publish-article-button').click();

        //shows toast
        helpers.expectToastToBeVisible();

        //updates article
        browser.get('help-center/manage/articles');
        $('.articles-search-input').sendKeys('article title updated');
        expect($$('.articles-list-item').count()).toEqual(1);
        expect($$('.article-title').first().getText()).toEqual('article title updated');
    });

    function updateArticleBodyAndTitle() {
        $('.article-title-input').clear().then(() => {
            $('.article-title-input').sendKeys('article title');
        });
        helpers.typeIntoTextEditor('article body');
    }

    function addCategoryAndTagToArticle() {
        $$('categories-manager label').get(1).click();
        $('tags-manager input').sendKeys('tag');
        $('.add-tags-button').click();
    }

    function updateArticleSettings() {
        $('.article-settings-action').click();
        $('#article-slug').sendKeys('slug');
        $('#article-description').sendKeys('description');
        $('#article-position').sendKeys('15');
        helpers.confirmModalAction();
    }
});
