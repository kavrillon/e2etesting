let assert = require('assert');

describe('visual regressions checker', () => {
    it('should be the same body', () => {
        browser.url('/').pause(1000);
        assert.ok(browser.checkDocument()[0].isWithinMisMatchTolerance);
    });

    it('should be the same header', () => {
        browser.url('/').pause(1000);

        assert.ok(browser.checkElement('header')[0].isWithinMisMatchTolerance);
    });
});
