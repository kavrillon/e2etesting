require('jasmine2-custom-message');

const w3cjs = require('w3cjs');
const pa11y = require('pa11y');
const pages = require('../../config/pages');
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
            let displays = browser.getCssProperty('h1,h2,h3,h4,h5,h6', 'display');
            let visibilities = browser.getCssProperty('h1,h2,h3,h4,h5,h6', 'visibility');
            let opacities = browser.getCssProperty('h1,h2,h3,h4,h5,h6', 'opacity');
            let isHiddenTitle = false;

            if (displays) {
                if (!Array.isArray(displays)) {
                    displays = [displays];
                }

                displays.forEach((elt) => {
                    if (elt.value === 'none') {
                        isHiddenTitle = true;
                    }
                });
            }
            if (visibilities) {
                if (!Array.isArray(visibilities)) {
                    visibilities = [visibilities];
                }

                visibilities.forEach((elt) => {
                    if (elt.value === 'hidden') {
                        isHiddenTitle = true;
                    }
                });
            }
            if (opacities) {
                if (!Array.isArray(opacities)) {
                    opacities = [opacities];
                }

                opacities.forEach((elt) => {
                    if (elt.value === 0) {
                        isHiddenTitle = true;
                    }
                });
            }

            expect(isHiddenTitle).toBe(false);
        });

        it('should have no empty heading', () => {

            // Using getHTML instead of getText because of headers have to be interactable - so we remove html after
            let texts = browser.getHTML('h1,h2,h3,h4,h5,h6');
            let isEmpty = false;

            if (texts) {
                if (!Array.isArray(texts)) {
                    texts = [texts];
                }

                texts.forEach((elt) => {
                    if (elt.replace(/<[^>]+>/g, '').trim() === '') {
                        isEmpty = true;
                    }
                });
            }

            expect(isEmpty).toBe(false);
        });

        it('should have no hierarchy break in headings', () => {
            let isValid = true;
            let logMessage = '';
            let headings = browser.getTagName('h1,h2,h3,h4,h5,h6');
            let level = 0;

            if (headings) {
                if (!Array.isArray(headings)) {
                    headings = [headings];
                }

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

        it('should have no W3C errors', () => {
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
                        if (msg.type === 'error') {
                            logMessage += `|||${msg.type[0].toUpperCase() + msg.type.substring(1)}: ${msg.message}`;
                            if (msg.extract) {
                                logMessage += `###Line ${msg.lastLine}: ${JSON.stringify(msg.extract.replace(/[^\x20-\x7E]/gmi, '').trim())}`;
                            }
                            countErrors++;
                        }
                    }

                });
                since(logMessage).expect(countErrors).toBe(0);
            });
        });

        it('should have no A11Y errors', () => {
            const test = pa11y({
                ignore: [
                    'notice',
                    'warning',
                    // 'WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail'
                ]
            });
            let countErrors = 0;
            let logMessage = '';

            return new Promise((resolve, reject) => {
                test.run(baseUrl + page.url, (error, results) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(results);
                    }
                });
            }).then((results) => {
                if (results) {
                    results.forEach((msg) => {
                        logMessage += `|||${msg.type[0].toUpperCase() + msg.type.substring(1)}: ${msg.message}`;
                        if (msg.selector) {
                            logMessage += `###Selector: ${msg.selector}`;
                        }
                        if (msg.context) {
                            logMessage += `###Context: ${JSON.stringify(msg.context.replace(/[^\x20-\x7E]/gmi, ''))}`;
                        }
                        if (msg.type === 'error') {
                            countErrors++;
                        }
                    });
                }

                since(logMessage).expect(countErrors).toBe(0);
            });
        });
    });
});
