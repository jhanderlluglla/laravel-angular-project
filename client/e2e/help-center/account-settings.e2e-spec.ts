import {browser, $, $$} from "protractor";
import {helpers} from "../helpers.e2e";

describe('Account Settings Page', function() {
    const pageUrl = 'account/settings';

    it('should update name and profile image', () => {
        browser.get(pageUrl);

        //update names and profile image
        $('#first_name').sendKeys('foo');
        $('#last_name').sendKeys('bar');
        //helpers.uploadFile($('.avatar-upload-button'));

        $('.account-settings-panel .submit-button').click();

        //shows success toast message
        helpers.expectToastToBeVisible();
    });

    it('should update password', () => {
        browser.get(pageUrl);

        $('#current_password').sendKeys('tester');
        $('#new_password').sendKeys('tester123');
        $('#new_password_confirmation').sendKeys('tester123');
        $('.change-password-panel .submit-button').click();

        //shows success toast message
        helpers.expectToastToBeVisible();

        //change password back to original
        $('#current_password').sendKeys('tester123');
        $('#new_password').sendKeys('tester');
        $('#new_password_confirmation').sendKeys('tester');
        $('.change-password-panel .submit-button').click();
    });

    it('should update account preferences', () => {
        browser.get(pageUrl);

        $$('#language option').first().click();
        $$('#timezone option').first().click();
        $$('#country option').first().click();
        $('.preferences-panel .submit-button').click();

        //shows success toast message
        helpers.expectToastToBeVisible();
    });
});
