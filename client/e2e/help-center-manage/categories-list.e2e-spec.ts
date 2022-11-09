import {browser, $, $$, element, by} from "protractor";
import {helpers} from "../helpers.e2e";

describe('Categories List Page', function() {
    const pageUrl = 'help-center/manage/categories';

    beforeAll(() => {
        browser.get(pageUrl);
    });

    it('should display categories', () => {
        //renders parent categories
        expect($$('.parent-category').count()).toBeGreaterThan(1);
        expect($$('.parent-category .category-name').first().getText()).toBeNonEmptyString();
        $$('.parent-category .has-articles').first().getText().then(count => {
            expect(parseInt(count)).toBeGreaterThanOrEqualTo(1);
        });

        //renders child categories
        expect($$('.child-category').count()).toBeGreaterThan(2);
        expect($$('.child-category .category-name').first().getText()).toBeNonEmptyString();
    });

    it('should update, create and delete a category', () => {
        //creates category
        $('.new-category-button').click();
        $('#name').sendKeys('123 category');
        $('#description').sendKeys('description');
        helpers.confirmModalAction();
        expect(findCategoryByName('123 category').isPresent()).toBeTruthy();

        //updates category
        $$('.update-category-button').first().click();
        $('#name').sendKeys(' updated');
        $('#description').sendKeys(' updated');
        $$('#parent_id option').get(1).click();
        helpers.confirmModalAction();
        expect($$('.child-category .category-name').first().getText()).toEqual('123 category updated');

        //deletes category
        $$('category-list-item').count().then(oldCount => {
            $$('.child-category .delete-category-button').first().click();
            helpers.confirmModalAction();
            expect($$('category-list-item').count()).toBeLessThan(oldCount);
            expect(findCategoryByName('123 category updated').isPresent()).toBeFalsy();
        });
    });

    it('should create and detach child category', () => {
        //creates child category
        $$('.new-child-category-button').first().click();
        $('#name').sendKeys('123 child category');
        $('#description').sendKeys('description');
        helpers.confirmModalAction();
        expect($$('.child-category .category-name').first().getText()).toEqual('123 child category');

        //detaches child category
        $$('.detach-category-button').first().click();
        helpers.confirmModalAction();
        expect($$('.parent-category .category-name').first().getText()).toEqual('123 child category');

        //delete child category
        $$('.parent-category .delete-category-button').first().click();
        helpers.confirmModalAction();
    });

    it('should filter categories by search query', () => {
        $$('.category-name').first().getText().then(text => {
            $('.categories-search-input').sendKeys(text);
            expect($$('.category-name').count()).toEqual(4);
            expect($$('.category-name').first().getText()).toEqual(text);
        })
    });

    xit('dnd', () => {
        $$('.child-category .category-name').get(0).getText().then(text => {
            browser.actions().dragAndDrop($$('.child-category .drag-handle').get(0), $$('.child-category .drag-handle').get(1));
            expect($$('.child-category .category-name').get(1).getText()).toEqual(text);
        });
    });

    function findCategoryByName(name: string) {
        return element(by.cssContainingText('.category-name', name));
    }
});
