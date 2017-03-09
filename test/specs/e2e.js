let assert = require('assert');

describe('e2e checker', () => {

    it('should be the correct title', () => {
        browser.url('/');
        let title = browser.getTitle();
        assert.equal(title, 'FO Tester');
    });
});
