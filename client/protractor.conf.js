// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const {SpecReporter} = require('jasmine-spec-reporter');

exports.config = {
    allScriptsTimeout: 11000,
    specs: [
        './e2e/**/*.e2e-spec.ts'
    ],
    capabilities: {
        'browserName': 'chrome'
    },
    directConnect: true,
    baseUrl: 'http://localhost:4200/',
    framework: 'jasmine',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        print: function () {}
    },
    onPrepare() {
        require("jasmine-expect");

        require('ts-node').register({
            project: 'e2e/tsconfig.e2e.json'
        });

        jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));

        browser.ignoreSynchronization = true;
        browser.get(exports.config.baseUrl + 'secure/e2e-start');
        browser.ignoreSynchronization = false;

        browser.get('/login');

        browser.findElement(by.css('#email')).sendKeys('admin@tester.com');
        browser.findElement(by.css('#password')).sendKeys('tester');
        browser.findElement(by.css('.submit-button')).click();

        return browser.wait(function () {
            return browser.getCurrentUrl().then(function (url) {
                return !/login/.test(url);
            });
        }, 1000);
    }
};

