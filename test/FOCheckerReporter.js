var util = require('util'),
    events = require('events'),
    _Object$keys = require('babel-runtime/core-js/object/keys')['default'],
    _humanizeDuration = require('humanize-duration');


var DURATION_OPTIONS = {
    units: ['m', 's'],
    round: true,
    spacer: ''
};

var FOCheckerReporter = function(baseReporter, config) {
    this.baseReporter = baseReporter;
    this.config = config;
    this.errorCount = 0;
    this.indents = {};
    this.suiteIndents = {};
    this.specs = {};
    this.results = {};
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

    this.on('test:pending', function (test) {
        this.results[test.cid].pending++;
    });

    this.on('test:pass', function (test) {
        this.results[test.cid].passing++;
    });

    this.on('test:fail', function (test) {
        this.results[test.cid].failing++;
    });

    this.on('suite:end', function (suite) {
        this.indents[suite.cid]--;
    });

    this.on('runner:end', function (runner) {
        this.printSuiteResult(runner)
    });

    this.printSuiteResult = function(runner) {
        console.log(this.getSuiteResult(runner));
    }

    this.getSuiteResult = function(runner) {
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
    }

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

    this.getResultList = function(cid, suites) {
        var preface = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

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

    this.getSummary = function(states, duration) {
        var preface = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

        var output = '';
        var displayedDuration = false;

        for (var state in states) {
            var testCount = states[state];
            var testDuration = '';

            /**
             * don't display 0 passing/pending of failing test label
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

        failures.forEach(function (test, i) {
            var messages = test.err.message.split('|||');
            var title = typeof test.parent !== 'undefined' ? test.parent + ' ' + test.title : test.title;
            output += preface.trim() + '\n';

            var count = 0;
            var buffer = '';
            messages.forEach(function(msg) {
                msg = msg.trim().replace('\n', _this.baseReporter.color('', '\n' + preface + ' '));
                if (msg !== '') {
                    count++;
                    var color = msg.indexOf('warning') == 0 || msg.indexOf('info') == 0 ? 'pending' : 'fail';
                    buffer += preface + ' ' + _this.baseReporter.color(color, msg) + '\n';
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
