var Utils = function() {
    this.getBaseUrl = function(conf) {
        var baseUrl = conf.baseUrl;
        if (conf.htaccess !== undefined && conf.htaccess != '') {
            baseUrl = conf.baseUrl.replace(/(http[s]*:\/\/)/, '$1' + conf.htaccess + '@');
        }
        return baseUrl;
    }
};

module.exports = new Utils();
