import Controller from './libs/Controller';
import _find from 'lodash/find';

export default class AppController extends Controller {
    constructor() {
        super();

        // Controller vars
        this.defaultAppTitle = document.querySelector('[data-js-title]').innerHTML;

        // DOM vars
        this.appTitle = document.querySelector('[data-js-title]');

        // Init calls
        this.bindEvents();
        this.init();
    }

    init() {
        if (window.location.href.match(/\?test/)) {
            document.querySelector('.content').innerHTML = '<div class="content--demo"><h5>TEST PAGE</h5></div>';
        }
    }

    bindEvents() {
        // Array.from(document.querySelectorAll('[js-link]')).forEach((elt) => {
        //     elt.addEventListener('click', (e) => {
        //         this.setPage(e.target.getAttribute('js-link'));
        //         this.closeSideNav();
        //     });
        // });
    }
}
