let assert = require('assert');

describe('visual regressions checker', () => {
    const url = '/?' + Math.random(); // add some randomness for cache

    it('should be the same body', () => {
        browser.url(url).pause(1000);
        assert.ok(browser.checkDocument()[0].isWithinMisMatchTolerance);
    });

    it('should be the same header', () => {
        browser.url(url).pause(1000);

        assert.ok(browser.checkElement('header')[0].isWithinMisMatchTolerance);
    });
});
