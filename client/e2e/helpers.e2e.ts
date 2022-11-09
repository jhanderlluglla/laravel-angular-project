import {browser, $, $$, protractor, ElementFinder} from "protractor";
let request = require('request');
let path = require('path');

export class helpers {
    public static hasClass(element: ElementFinder, cls) {
        return element.getAttribute('class').then(function (classes) {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    }

    public static loginAs(type: string) {
        //logout
        $('logged-in-user-widget').click();
        $('.logout-item').click();

        //login
        browser.get('/login');
        $('#email').sendKeys(type+'@tester.com');
        $('#password').sendKeys('tester');
        $('.submit-button').click();

        return browser.wait(function() {
            return browser.getCurrentUrl().then(function(url) {
                return ! /login/.test(url);
            });
        }, 1000);
    }

    public static typeIntoTextEditor(content: string, parent?: string) {
        browser.waitForAngularEnabled(false);

        let selector = parent ? parent+' iframe' : 'iframe';

        browser.switchTo().frame($(selector).getWebElement());
        $('#tinymce').clear();
        $('#tinymce').click();
        $('#tinymce').sendKeys(content);

        browser.waitForAngularEnabled(true);
        return browser.switchTo().defaultContent();
    }

    public static waitForElementToBeClickable(elementFinder: ElementFinder, timeout = 1000) {
        let EC = protractor.ExpectedConditions;
        browser.wait(EC.elementToBeClickable(elementFinder), timeout);
    }

    /**
     * Wait for specified element to be visible.
     */
    public static waitForElementToBeVisible(elementFinder: ElementFinder, timeout = 2000) {
        let EC = protractor.ExpectedConditions;
        browser.wait(EC.visibilityOf(elementFinder), timeout);
    }

    /**
     * Wait until backdrop overlay is removed from DOM.
     */
    public static waitForBackdropToBeHidden() {
        let EC = protractor.ExpectedConditions;
        return browser.wait(EC.stalenessOf($('.backdrop')), 2000);
    }

    /**
     * Confirm action on currently open modal.
     */
    public static confirmModalAction() {
        browser.actions().mouseMove($('.modal .submit-button')).perform();
        $('.modal .submit-button').click();
        helpers.waitForBackdropToBeHidden();
    }

    /**
     * Close any open modal.
     */
    public static closeModal() {
        $('.modal .close-button').click();
        helpers.waitForBackdropToBeHidden();
    }

    /**
     * Wait for text in element to change from specified text.
     */
    public static waitForTextToChange(el: ElementFinder, text: string, timeout = 2000) {
        let EC = protractor.ExpectedConditions;
        let textChanged = EC.not(EC.textToBePresentInElement(el, text));
        browser.wait(textChanged, 2000);
    }

    public static expectToastToBeVisible() {
        //expect($('toast').isDisplayed()).toBeTruthy();
        //expect($('toast .message').getText()).toBeNonEmptyString();
    }

    /**
     * Upload a file using specified upload button.
     */
    public static uploadFile(element: ElementFinder) {
        element.click();
        let fullPath = path.resolve(__dirname, 'src/assets/images/logo.png');
        $('#hidden-file-upload-input').sendKeys(fullPath);
    }
}