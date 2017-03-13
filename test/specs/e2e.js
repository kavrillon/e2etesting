var w3cjs = require('w3cjs');
const url = '/?' + Math.random(); // add some randomness for cache

describe('Technical', () => {
    it('should be a title', () => {
        browser.url(url);
        expect(browser.getTitle()).not.toBe('');
    });

    it('should be a description', () => {
        browser.url(url);
        expect(browser.getAttribute('meta[name="description"]', 'content')).not.toBe('');
    });

    it('should have one <h1>', () => {
        browser.url(url);
        expect(browser.elements('h1').value.length).toEqual(1);
    });

    it('should have no hidden title (h levels)', () => {
        browser.url(url);

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

    it('should have no hierarchy break (h levels)', () => {
        browser.url(url);

        let isValid = true;
        let headings = browser.getTagName('h1,h2,h3,h4,h5,h6');
        let level = 0;

        headings.forEach((elt) => {
            const match = elt.match(/[0-9]/);
            if (match) {
                const val = match[0];
                if (val - level > 1) {
                    isValid = false;
                }
                level = val;
            }
        });

        expect(isValid).toBe(true);
    });

    it('should have no w3c errors', () => {
        browser.url(url);

        const html = browser.getSource();

        w3cjs.validate({
            input: html,
            callback: function (res) {
                expect(res.messages.length).toBe(0);
                // done();
                // res.messages.forEach((msg) => {
                //     console.log(msg.type + ' - ' + msg.message + ' (' + msg.lastLine + ')');
                //     // fail(msg);
                // });
                // if (res.messages.length > 0 ) {
                //     throw {error: 'html errors have been found', results: res};
                // }
            }
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
    it('should be the same body', () => {
        browser.url(url).pause(1000);
        expect(browser.checkDocument()[0].isWithinMisMatchTolerance).toBe(true);
    });
});
