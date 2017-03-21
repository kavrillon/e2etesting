var w3cjs = require('w3cjs');
require('jasmine2-custom-message');
var pages = require('../../config/pages');
const baseUrl = pages.baseUrl;


pages.list.forEach((page) => {
    describe('# Visual Regressions: ' + baseUrl + page.url + ' ', () => {
        beforeAll(function (done) {
            browser.url(page.url).call(done);
        });

        afterAll(function (done) {
            browser.end(done);
        });

        it('should be the same body', () => {
            browser.pause(1000);
            expect(browser.checkDocument()[0].isWithinMisMatchTolerance).toBe(true);
        });
    });
});
