let assert = require('assert');
import pjson from '../../package.json';


describe('e2e checker', () => {

    it('should be the correct title', () => {
        browser.url('/');
        let title = browser.getTitle();
        assert.equal(title, pjson.name);
    });
});
