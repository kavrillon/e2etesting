var util = require('util'),
    fs = require('fs'),
    events = require('events'),
    _Object$keys = require('babel-runtime/core-js/object/keys')['default'],
    _humanizeDuration = require('humanize-duration'),
    opn = require('opn'),
    pages = require('./../config/pages'),
    htmlEncode = require('htmlencode').htmlEncode;


var DURATION_OPTIONS = {
    units: ['m', 's'],
    round: true,
    spacer: ''
};

var HTML_REPORT = './tests/report.html';
var HEADER_REPORT = './tests/header.html';

var FOCheckerReporter = function(baseReporter, config) {
    this.baseReporter = baseReporter;
    this.config = config;
    this.errorCount = 0;
    this.indents = {};
    this.suiteIndents = {};
    this.specs = {};
    this.results = {};
    this.runners = [];
    this.shortEnglishHumanizer = _humanizeDuration.humanizer({
        language: 'shortEn',
        languages: { shortEn: {
            h: function h() {
                return 'h';
            },
            m: function m() {
                return 'm';
            },
            s: function s() {
                return 's';
            },
            ms: function ms() {
                return 'ms';
            }
        } }
    });

    this.on('runner:start', function (runner) {
        this.suiteIndents[runner.cid] = {};
        this.indents[runner.cid] = 0;
        this.specs[runner.cid] = runner.specs;
        this.results[runner.cid] = {
            passing: 0,
            pending: 0,
            failing: 0
        }
    });

    this.on('suite:start', function (suite) {
        this.suiteIndents[suite.cid][suite.title] = ++this.indents[suite.cid];
    });

    this.on('tests:pending', function (test) {
        this.results[test.cid].pending++;
    });

    this.on('tests:pass', function (test) {
        this.results[test.cid].passing++;
    });

    this.on('tests:fail', function (test) {
        this.results[test.cid].failing++;
    });

    this.on('suite:end', function (suite) {
        this.indents[suite.cid]--;
    });

    this.on('runner:end', function (runner) {
        this.printSuiteResult(runner);
        this.runners.push(runner);
    });

    this.on('end', function () {
        var output = '';
        var fileContent = '';

        for (var i = 0; i < this.runners.length; i++) {
            output += this.createHTMLReport(this.runners[i]);
        }

        if (!fs.existsSync(HTML_REPORT)) {
            fileContent = fs.readFileSync(HEADER_REPORT) + output + '</body></html>';
        }
        else {
            fileContent = fs.readFileSync(HTML_REPORT, 'utf8');
            fileContent = fileContent.replace('</body></html>', output + '</body></html>');
        }

        fs.writeFileSync(HTML_REPORT, fileContent);
        opn(HTML_REPORT);
    });


    this.printSuiteResult = function(runner) {
        console.log(this.getConsoleSuiteResult(runner));
    };

    this.getConsoleSuiteResult = function(runner) {
        var cid = runner.cid;
        var stats = this.baseReporter.stats;
        var results = stats.runners[cid];
        var preface = '[' + this.getBrowserCombo(results.capabilities, false) + ' #' + cid + ']';
        var specHash = stats.getSpecHash(runner);
        var spec = results.specs[specHash];
        var combo = this.getBrowserCombo(results.capabilities);
        var failures = stats.getFailures().filter(function (f) {
            return f.cid === cid || _Object$keys(f.runner).indexOf(cid) > -1;
        });
        if (_Object$keys(spec.suites).length === 0) {
            return '';
        }

        this.errorCount = 0;
        var output = '';

        output += '==================================================================================\n';
        output += preface + ' Session ID: ' + results.sessionID + '\n';
        output += preface + ' Spec: ' + this.specs[cid] + '\n';
        output += preface + ' Running: ' + combo + '\n';
        output += preface + '\n';
        output += this.getResultList(cid, spec.suites, preface);
        output += preface + '\n';
        output += this.getSummary(this.results[cid], spec._duration, preface);
        output += preface + '\n';
        output += this.getFailureList(failures, preface);
        output += preface + '\n';
        return output;
    };

    this.createHTMLReport = function(runner) {
        var cid = runner.cid;
        var stats = this.baseReporter.stats;
        var results = stats.runners[cid];
        var preface = '[' + this.getBrowserCombo(results.capabilities, false) + ' #' + cid + ']';
        var specHash = stats.getSpecHash(runner);
        var spec = results.specs[specHash];
        var combo = this.getBrowserCombo(results.capabilities);
        var failures = stats.getFailures().filter(function (f) {
            return f.cid === cid || _Object$keys(f.runner).indexOf(cid) > -1;
        });
        if (_Object$keys(spec.suites).length === 0) {
            return '';
        }

        var lineSeparator = '|||';
        var infoSeparator = '###';
        this.errorCount = 0;

        var output = '<div class="suite active">';
        output += '<div class="suite__header">';
        var cid = this.specs[cid][0].match(/([a-zA-Z-0-9]+).js/);
        if (cid) {
            cid = cid[1];
            output += '<div class="suite__header__specs">Specs: ' + cid + '</div>';
        }
        output += '<div class="suite__header__combo">Browser: ' + combo + '</div>';
        output += '</div>';

        output += '<div class="suite__results">';

        for (var specUid in spec.suites) {
            var sp = spec.suites[specUid];
            var specTitle = spec.suites[specUid].title;

            var resultBuffer = '';
            var resultErrors = 0;

            for (var testUid in sp.tests) {
                if (specUid.indexOf('"before all"') === 0) {
                    continue;
                }

                var test = sp.tests[testUid];
                var testTitle = sp.tests[testUid].title;
                var buffer = '';
                var countBuffer = '';

                if (test.state === '') {
                    continue;
                }

                // Display screenshot if available
                var browserVersion = results.capabilities.browser_version ? '_v' + results.capabilities.browser_version : '';
                var browserName = results.capabilities.browserName;
                var page = this.getPageNameFromSpecTitle(specTitle);
                var testName = 'body';

                var testElt = test.title.match(/<([^>]+)>/);
                if (testElt) {
                    testName = testElt[1];
                }

                var screenName = browserName + browserVersion + '_' + page + '_' + testName + '.png';
                var isScreen = false;
                if (fs.existsSync('./tests/screenshots/baseline/' + screenName)) {
                    isScreen = true;
                }

                if (test.state == 'fail') {
                    var failure = failures.filter(function (f) {
                        return f.uid === test.uid || _Object$keys(f.runner).indexOf(test.uid) > -1;
                    });

                    if (failure.length > 0) {
                        failure = failure[0];
                        var title = typeof failure.parent !== 'undefined' ? failure.parent + ' ' + failure.title : failure.title;
                        var messages = failure.err.message.split(lineSeparator);
                        var count = 0;

                        messages.forEach(function (msg) {
                            var infos = null;
                            if (msg.indexOf(infoSeparator) > -1) {
                                infos = msg.split(infoSeparator);
                                msg = msg.split(infoSeparator)[0];
                                infos.shift();
                            }

                            if (msg !== '') {
                                count++;

                                if (!isScreen) {
                                    buffer += '<div class="result__test__msg">' + htmlEncode(msg) + '</div>';

                                    if (infos && infos.length > 0) {
                                        infos.forEach(function (i) {
                                            buffer += '<div class="result__test__info">' + htmlEncode(i.replace(/\\/g, '')) + '</div>';
                                        });
                                    }
                                }
                            }
                        });

                        countBuffer += ': ' + count + ' error' + (count > 1 ? 's' : '');
                        resultErrors += count;
                    }
                }

                resultBuffer += '<div class="result__test result__test--' + test.state + '">';
                resultBuffer += '<div class="result__test__header">';
                resultBuffer += '<div class="result__test__header__symbol" title="' + test.state + '">' + this.getSymbol(test.state) + '</div>';
                resultBuffer += '<div class="result__test__header__title">' + htmlEncode(testTitle) + '</div>';
                resultBuffer += '<div class="result__test__header__count">' + countBuffer + '</div>';

                resultBuffer += '</div>';
                resultBuffer += buffer;


                if (isScreen) {
                    resultBuffer += '<div class="result__test__screens">';
                    resultBuffer += '<div class="result__test__screens__screen">';
                    resultBuffer += '<div class="result__test__screens__screen__title" >Baseline</div>';
                    resultBuffer += '<img class="result__test__screens__screen__pic" onclick="window.open(\'screenshots/baseline/' + screenName + '\',\'_blank\');" src="screenshots/baseline/' + screenName + '" />';
                    resultBuffer += '</div>';

                    if (fs.existsSync('./tests/screenshots/current/' + screenName)) {
                        resultBuffer += '<div class="result__test__screens__screen">';
                        resultBuffer += '<div class="result__test__screens__screen__title" >Current screenshot</div>';
                        resultBuffer += '<img class="result__test__screens__screen__pic" onclick="window.open(\'screenshots/current/' + screenName + '\',\'_blank\');" src="screenshots/current/' + screenName + '" />';
                        resultBuffer += '</div>';
                    }
                    if (fs.existsSync('./tests/screenshots/diff/' + screenName)) {
                        resultBuffer += '<div class="result__test__screens__screen">';
                        resultBuffer += '<div class="result__test__screens__screen__title" >Diff</div>';
                        resultBuffer += '<img class="result__test__screens__screen__pic" onclick="window.open(\'screenshots/diff/' + screenName + '\',\'_blank\');" src="screenshots/diff/' + screenName + '" />';
                        resultBuffer += '</div>';
                    }

                    resultBuffer += '</div>';
                }

                resultBuffer += '</div>';
            }

            output += '<div class="result ' + (resultErrors > 0 ? 'result--error' : '') + '">';
            output += '<div class="result__spec">URL: <a href="' + pages.baseUrl + this.getPageUrlFromSpecTitle(specTitle) + '">' + pages.baseUrl + this.getPageUrlFromSpecTitle(specTitle) + '</a></div>';
            output += resultBuffer;
            output += '</div>';
        }

        output += '</div>';
        output += '</div>';
        output += '</div>';

        return output;
    };

    this.getBrowserCombo = function(caps) {
        var verbose = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        var device = caps.deviceName;
        var browser = caps.browserName;
        var version = caps.version || caps.platformVersion;
        var platform = caps.platform || caps.platformName;

        if (device) {
            var program = (caps.app || '').replace('sauce-storage:', '') || caps.browserName;
            var executing = program ? 'executing ' + program : '';

            if (!verbose) {
                return device + ' ' + platform + ' ' + version;
            }
            return (device + ' on ' + platform + ' ' + version + ' ' + executing).trim();
        }

        if (!verbose) {
            return (browser + ' ' + (version || '') + ' ' + (platform || '')).trim();
        }
        return browser + (version ? ' (v' + version + ')' : '') + (platform ? ' on ' + platform : '');
    };

    this.indent = function(cid, specUid) {
        var indents = this.suiteIndents[cid] && this.suiteIndents[cid][specUid] || -1;
        return indents < 0 ? '' : Array(indents).join('  ');
    };

    this.getResultList = function(cid, suites, preface) {
        var output = '';

        for (var specUid in suites) {
            var spec = suites[specUid];
            var indent = this.indent(cid, specUid);
            var specTitle = suites[specUid].title;

            output += preface + '   ' + indent + specTitle + '\n';

            for (var testUid in spec.tests) {
                // Remove "before all" tests from the displayed results
                if (specUid.indexOf('"before all"') === 0) {
                    continue;
                }

                var test = spec.tests[testUid];
                var testTitle = spec.tests[testUid].title;

                if (test.state === '') {
                    continue;
                }

                output += preface;
                output += '       ' + indent;
                output += this.baseReporter.color(this.getColor(test.state), this.getSymbol(test.state));
                output += ' ' + testTitle + '\n';
            }

            output += preface.trim() + '\n';
        }

        return output;
    };

    this.getColor = function(state) {
        var color = null; // in case of an unknown state

        switch (state) {
            case 'pass':
            case 'passing':
                color = 'green';
                break;
            case 'pending':
                color = 'pending';
                break;
            case 'fail':
            case 'failing':
                color = 'fail';
                break;
        }

        return color;
    };

    this.getSymbol = function(state) {
        var symbols = this.baseReporter.symbols;

        var symbol = '?'; // in case of an unknown state

        switch (state) {
            case 'pass':
                symbol = symbols.ok;
                break;
            case 'pending':
                symbol = '-';
                break;
            case 'fail':
                this.errorCount++;
                symbol = this.errorCount + ')';
                break;
        }

        return symbol;
    };

    this.getSummary = function(states, duration, preface) {
        var output = '';
        var displayedDuration = false;

        for (var state in states) {
            var testCount = states[state];
            var testDuration = '';

            /**
             * don't display 0 passing/pending of failing tests label
             */
            if (testCount === 0) {
                continue;
            }

            /**
             * set duration
             */
            if (!displayedDuration) {
                testDuration = ' (' + this.shortEnglishHumanizer(duration, DURATION_OPTIONS) + ')';
            }

            output += preface + ' ';
            output += this.baseReporter.color(this.getColor(state), testCount);
            output += ' ' + this.baseReporter.color(this.getColor(state), state);
            output += testDuration;
            output += '\n';
            displayedDuration = true;
        }

        return output;
    };

    this.getFailureList = function(failures, preface) {
        var _this = this;

        var output = '';
        var lineSeparator = '|||';
        var infoSeparator = '###';

        failures.forEach(function (test, i) {
            var messages = test.err.message.split(lineSeparator);
            var title = typeof test.parent !== 'undefined' ? test.parent + ' ' + test.title : test.title;
            output += preface.trim() + '\n';

            var count = 0;
            var buffer = '';
            messages.forEach(function(msg) {
                msg = msg.trim().replace('\n', _this.baseReporter.color('', '\n' + preface + ' '));

                var infos = null;
                if (msg.indexOf(infoSeparator) > -1) {
                    infos = msg.split(infoSeparator);
                    msg = msg.split(infoSeparator)[0];
                    infos.shift();
                }

                if (msg !== '') {
                    count++;
                    var color = msg.indexOf('warning') == 0 || msg.indexOf('info') == 0 ? 'pending' : 'fail';
                    buffer += preface + ' ' + _this.baseReporter.color(color, msg) + '\n';

                    if (infos && infos.length > 0) {
                        infos.forEach(function(i) {
                            buffer += preface + ' ' + _this.baseReporter.color(color, i) + '\n';
                        });
                        buffer += preface + '\n';
                    }
                }
            });

            output += preface + ' ------------------------------------------------\n';
            output += preface + ' ' + _this.baseReporter.color('error title', i + 1 + ') ' + title + ':') + '\n';
            output += preface + ' ' + _this.baseReporter.color('fail', count + ' error(s)') + '\n';
            output += preface.trim() + '\n';

            output += buffer;
        });

        return output;
    };

    this.getPageNameFromSpecTitle = function(title) {
        // Find url in title
        var res = title.match(/\bhttps?:\/\/\S+/gi);

        if (res) {
            var url = res[0].replace(pages.htaccess + '@', '');
            url = url.replace(pages.baseUrl, '');

            for (var i=0; i<pages.list.length; i++) {
                if (pages.list[i].url === url) {
                    return pages.list[i].name;
                }
            }
        }
        return 'unknown';
    };

    this.getPageUrlFromSpecTitle = function(title) {
        // Find url in title
        var res = title.match(/\bhttps?:\/\/\S+/gi);

        if (res) {
            var url = res[0].replace(pages.htaccess + '@', '');
            url = url.replace(pages.baseUrl, '');

            for (var i=0; i<pages.list.length; i++) {
                if (pages.list[i].url === url) {
                    return pages.list[i].url;
                }
            }
        }
        return '';
    };
};
FOCheckerReporter.reporterName = 'FOCheckerReporter';

/**
 * Inherit from EventEmitter
 */
util.inherits(FOCheckerReporter, events.EventEmitter);
/**
 * Expose Custom Reporter
 */
exports = module.exports = FOCheckerReporter;
