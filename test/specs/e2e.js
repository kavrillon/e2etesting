var w3cjs = require('w3cjs');
require('jasmine2-custom-message');
const url = '/?' + Math.random(); // add some randomness for cache

describe('Technical', () => {
    beforeAll(function (done) {
        browser.url(url).call(done);
    });

    afterAll(function (done) {
        browser.end(done);
    });

    it('should be a title', () => {
        expect(browser.getTitle()).not.toBe('');
    });

    it('should be a description', () => {
        expect(browser.getAttribute('meta[name="description"]', 'content')).not.toBe('');
    });

    it('should have one <h1>', () => {
        expect(browser.elements('h1').value.length).toEqual(1);
    });

    it('should have no hidden heading (h levels)', () => {
        const displays = browser.getCssProperty('h1,h2,h3,h4,h5,h6', 'display');
        const visibilities = browser.getCssProperty('h1,h2,h3,h4,h5,h6', 'visibility');
        const opacities = browser.getCssProperty('h1,h2,h3,h4,h5,h6', 'opacity');
        let isHiddenTitle = false;

        displays.forEach((elt) => {
            if (elt.value === 'none') {
                isHiddenTitle = true;
            }
        });
        visibilities.forEach((elt) => {
            if (elt.value === 'hidden') {
                isHiddenTitle = true;
            }
        });
        opacities.forEach((elt) => {
            if (elt.value === 0) {
                isHiddenTitle = true;
            }
        });

        expect(isHiddenTitle).toBe(false);
    });

    it('should have no hierarchy break in headings (h levels)', () => {
        let isValid = true;
        let logMessage = '';
        let headings = browser.getTagName('h1,h2,h3,h4,h5,h6');
        let level = 0;

        headings.forEach((elt) => {
            const match = elt.match(/[0-9]/);
            if (match) {
                const val = match[0];

                // check if diff between previous header level & current one is greater than one
                // if yes => there is a hierarchy break
                if (val - level > 1) {
                    isValid = false;
                    logMessage = `A <h${val}> is present without <h${val-1}>`;
                }
                level = val;
            }
        });

        since(logMessage).expect(isValid).toBe(true);
    });

    it('should have no w3c errors', () => {
        const html = browser.getSource();
        let logMessage = '';

        return new Promise((resolve) => {
            w3cjs.validate({
                input: html,
                callback: function (res) {
                    resolve(res.messages);
                }
            });
        }).then((messages) => {
            let countErrors = 0;
            messages.forEach((msg) => {
                logMessage += '\n' + msg.type + ' (' + msg.lastLine + ')' + ': ' + msg.message;
                if (msg.type === 'error') {
                    countErrors++;
                }
            });
            since(logMessage).expect(countErrors).toBe(0);
        });
    });
});

// describe('Functional', () => {
    // it('should be the correct title', () => {
    //     browser.url(url);
    //     let title = browser.getTitle();
    //     assert.equal(title, pjson.name);
    // });
// });

describe('Visual Regressions', () => {
    beforeAll(function (done) {
        browser.url(url).call(done);
    });

    afterAll(function (done) {
        browser.end(done);
    });

    it('should be the same body', () => {
        browser.pause(1000);
        expect(browser.checkDocument()[0].isWithinMisMatchTolerance).toBe(true);
    });
});
