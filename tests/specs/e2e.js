var w3cjs = require('w3cjs');
require('jasmine2-custom-message');
var pages = require('../../config/pages');
var Utils = require('./../utils');
var baseUrl = Utils.getBaseUrl(pages);

pages.list.forEach((page) => {
    describe('# Visual Regressions: ' + baseUrl + page.url + ' ', () => {
        beforeAll(function (done) {
            browser.url(baseUrl + page.url).call(done);
        });

        afterAll(function (done) {
            browser.end(done);
        });

        it('should be the same <body>', () => {
            browser.pause(5000);
            expect(browser.checkDocument()[0].isWithinMisMatchTolerance).toBe(true);
        });

        if (page.elements && page.elements.length > 0) {
            page.elements.forEach((elt) => {
                it('should be the same <' + elt + '> selector', () => {
                    browser.pause(5000);
                    expect(browser.checkElement(elt)[0].isWithinMisMatchTolerance).toBe(true);
                });
            });
        }
    });
});
