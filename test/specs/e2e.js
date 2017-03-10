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
