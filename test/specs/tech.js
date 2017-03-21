var w3cjs = require('w3cjs');
require('jasmine2-custom-message');
var pages = require('../../config/pages');
const baseUrl = pages.baseUrl;


pages.list.forEach((page) => {
    describe('# Technical: ' + baseUrl + page.url + ' ', () => {
        beforeAll(function (done) {
            browser.url(page.url).call(done);
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

            if (displays.length > 0) {
                displays.forEach((elt) => {
                    if (elt.value === 'none') {
                        isHiddenTitle = true;
                    }
                });
            }
            if (visibilities.length > 0) {
                visibilities.forEach((elt) => {
                    if (elt.value === 'hidden') {
                        isHiddenTitle = true;
                    }
                });
            }
            if (opacities.length > 0) {
                opacities.forEach((elt) => {
                    if (elt.value === 0) {
                        isHiddenTitle = true;
                    }
                });
            }

            expect(isHiddenTitle).toBe(false);
        });

        it('should have no hierarchy break in headings (h levels)', () => {
            let isValid = true;
            let logMessage = '';
            let headings = browser.getTagName('h1,h2,h3,h4,h5,h6');
            let level = 0;

            if (headings.length > 0) {
                headings.forEach((elt) => {
                    const match = elt.match(/[0-9]/);
                    if (match) {
                        const val = match[0];

                        // check if diff between previous header level & current one is greater than one
                        // if yes => there is a hierarchy break
                        if (val - level > 1) {
                            isValid = false;
                            logMessage = `A <h${val}> is present without <h${val - 1}>`;
                        }
                        level = val;
                    }
                });
            }

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
                    // Due to an error on Browserstack (the getSource method does not return the doctype, we remove this error
                    if (!msg.message.match('doctype')) {
                        logMessage += '\n' + msg.type + ' (' + msg.lastLine + ')' + ': ' + msg.message;
                        if (msg.type === 'error') {
                            countErrors++;
                        }
                    }

                });
                since(logMessage).expect(countErrors).toBe(0);
            });
        });
    });
});
