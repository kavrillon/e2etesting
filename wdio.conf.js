/*
 * Requires
 * -----------------------------------------------------------------------------
 */

var path = require('path');
var VisualRegressionCompare = require('wdio-visual-regression-service/compare');
var pages = require('./config/pages');

/*
 * Script parameters
 * -----------------------------------------------------------------------------
 */

var phantom = process.env.HEADLESS_PHANTOM == 'true' || false;

var browserStackUsername = process.env.BROWSERSTACK_USERNAME;
var browserStackAccessKey = process.env.BROWSERSTACK_ACCESS_KEY;

/*
 * Variables
 * -----------------------------------------------------------------------------
 */

var currentdate = new Date();
var datetime = currentdate.getFullYear() + '/'
    + (currentdate.getMonth()+1)  + '/'
    + currentdate.getDate() + '_'
    + currentdate.getHours() + ':'
    + currentdate.getMinutes() + ':'
    + currentdate.getSeconds();


var browsers = [];
var user, key;
var host = '0.0.0.0';
var port = 4444;
var browserstackLocal = false;
var services = ['visual-regression'];

/*
 * Check Browserstack username & access key (if not in PhantomJS mode)
 * -----------------------------------------------------------------------------
 */

if (!phantom && process.env.BROWSERSTACK_USERNAME == null) {
    throw 'You need to set your BrowserStack username as BROWSERSTACK_USERNAME enviroment variable!';
}

if (!phantom && process.env.BROWSERSTACK_ACCESS_KEY == null) {
    throw 'You need to set your BrowserStack access key as BROWSERSTACK_ACCESS_KEY enviroment variable!';
}

/*
 * Browsers Configuration
 * -----------------------------------------------------------------------------
 */

if (phantom === true) {
    browsers = [{browserName: 'phantomjs'}];
}
else {
    host = 'hub.browserstack.com';
    port = 80;
    user = browserStackUsername;
    key = browserStackAccessKey;
    browserstackLocal = true;
    services.push('browserstack');
    browsers = require('./config/browsers');
}

/*
 * Methods
 * -----------------------------------------------------------------------------
 */

function getPageNumberFromUrl(url) {
    url = url.replace(pages.baseUrl, '');

    for (var i=0; i<pages.list.length; i++) {
        if (pages.list[i].url === url) {
            return pages.list[i].name;
        }
    }
    return 'unknown';
}

function getScreenshotName(basePath) {
    return function(context) {
        // var type = context.type;
        var page = getPageNumberFromUrl(context.meta.url);
        var testName = context.meta.element === undefined ? 'body' : context.meta.element;
        var browserVersion = parseInt(context.browser.version, 10);
        var browserName = context.browser.name;
        var title = page + '_' + testName + '_' + browserName + '_v' + browserVersion + '.png';
        return path.join(basePath, title);
    };
}

/*
 * Global config
 * -----------------------------------------------------------------------------
 */

exports.config = {

    //
    // =================
    // Service Providers
    // =================
    // WebdriverIO supports Sauce Labs, Browserstack, and Testing Bot (other cloud providers
    // should work too though). These services define specific user and key (or access key)
    // values you need to put in here in order to connect to these services.
    //
    host: host,
    port: port,
    user: user,
    key: key,
    browserstackLocal: browserstackLocal,


    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called. Notice that, if you are calling `wdio` from an
    // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
    // directory is where your package.json resides, so `wdio` will be called from there.
    //
    specs: [
        './test/specs/**/*.js'
    ],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    //
    maxInstances: 10,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://docs.saucelabs.com/reference/platforms-configurator
    // https://www.browserstack.com/automate/node
    //
    commonCapabilities: {
        build: 'FO Tester'
    },
    capabilities: browsers,
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // By default WebdriverIO commands are executed in a synchronous way using
    // the wdio-sync package. If you still want to run your tests in an async way
    // e.g. using promises you can set the sync option to false.
    sync: true,
    //
    // Level of logging verbosity: silent | verbose | command | data | result | error
    logLevel: 'silent',
    //
    // Enables colors for log output.
    coloredLogs: true,
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Saves a screenshot to a given path if a command fails.
    screenshotPath: './errorShots/',
    //
    // Set a base URL in order to shorten url command calls. If your url parameter starts
    // with "/", then the base url gets prepended.
    baseUrl: pages.baseUrl,
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,
    //
    // Default timeout in milliseconds for request
    // if Selenium Grid doesn't send response
    connectionRetryTimeout: 90000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Initialize the browser instance with a WebdriverIO plugin. The object should have the
    // plugin name as key and the desired plugin options as properties. Make sure you have
    // the plugin installed before running any tests. The following plugins are currently
    // available:
    // WebdriverCSS: https://github.com/webdriverio/webdrivercss
    // WebdriverRTC: https://github.com/webdriverio/webdriverrtc
    // Browserevent: https://github.com/webdriverio/browserevent
    // plugins: {
    //     webdrivercss: {
    //         screenshotRoot: 'my-shots',
    //         failedComparisonsRoot: 'diffs',
    //         misMatchTolerance: 0.05,
    //         screenWidth: [320,480,640,1024]
    //     },
    //     webdriverrtc: {},
    //     browserevent: {}
    // },
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance
    // your test setup with almost no effort. Unlike plugins, they don't add new
    // commands. Instead, they hook themselves up into the test process.
    services: services,
    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: http://webdriver.io/guide/testrunner/frameworks.html
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'jasmine',
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: http://webdriver.io/guide/testrunner/reporters.html
    reporters: ['spec'],
    //
    // Options to be passed to Jasmine.
    jasmineNodeOpts: {
        //
        // Jasmine default timeout
        defaultTimeoutInterval: 60000,
        //
        // The Jasmine framework allows interception of each assertion in order to log the state of the application
        // or website depending on the result. For example, it is pretty handy to take a screenshot every time
        // an assertion fails.
        expectationResultHandler: function(passed, assertion) {
            if(passed) {
                return;
            }
            // console.log(assertion);
            // browser.saveScreenshot('assertionError_' + assertion.error.message + '.png');
        }
    },

    visualRegression: {
        compare: new VisualRegressionCompare.LocalCompare({
            referenceName: getScreenshotName(path.join(process.cwd(), 'screenshots/baseline')),
            screenshotName: getScreenshotName(path.join(process.cwd(), 'screenshots/current')),
            diffName: getScreenshotName(path.join(process.cwd(), 'screenshots/diff')),
            misMatchTolerance: 0.01,
        }),
        viewportChangePause: 300,
        widths: [/*480, 768, 992, */1200],
        orientations: ['landscape', 'portrait'],
    },

    //
    // =====
    // Hooks
    // =====
    // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
    // it and to build services around it. You can either apply a single function or an array of
    // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
    // resolved to continue.
    //
    // Gets executed once before all workers get launched.
    // onPrepare: function (config, capabilities) {
    // },
    //
    // Gets executed just before initialising the webdriver session and test framework. It allows you
    // to manipulate configurations depending on the capability or spec.
    // beforeSession: function (config, capabilities, specs) {
    // },
    //
    // Gets executed before test execution begins. At this point you can access all global
    // variables, such as `browser`. It is the perfect place to define custom commands.
    before: function (capabilities, specs) {
        require('babel-register');
    },
    //
    // Hook that gets executed before the suite starts
    // beforeSuite: function (suite) {
    // },
    //
    // Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
    // beforeEach in Mocha)
    // beforeHook: function () {
    // },
    //
    // Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
    // afterEach in Mocha)
    // afterHook: function () {
    // },
    //
    // Function to be executed before a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
    // beforeTest: function (test) {
    // },
    //
    // Runs before a WebdriverIO command gets executed.
    // beforeCommand: function (commandName, args) {
    // },
    //
    // Runs after a WebdriverIO command gets executed
    // afterCommand: function (commandName, args, result, error) {
    // },
    //
    // Function to be executed after a test (in Mocha/Jasmine) or a step (in Cucumber) starts.
    // afterTest: function (test) {
    // },
    //
    // Hook that gets executed after the suite has ended
    // afterSuite: function (suite) {
    // },
    //
    // Gets executed after all tests are done. You still have access to all global variables from
    // the test.
    // after: function (result, capabilities, specs) {
    // },
    //
    // Gets executed right after terminating the webdriver session.
    // afterSession: function (config, capabilities, specs) {
    // },
    //
    // Gets executed after all workers got shut down and the process is about to exit. It is not
    // possible to defer the end of the process using a promise.
    // onComplete: function(exitCode) {
    // }
};

/*
 * Global config modifs
 * -----------------------------------------------------------------------------
 */

exports.config.capabilities.forEach(function(caps){
    for(var i in exports.config.commonCapabilities) caps[i] = caps[i] || exports.config.commonCapabilities[i];
});

exports.config.capabilities.forEach(function(caps){
    caps.name = datetime + '_' + caps.name;
});

