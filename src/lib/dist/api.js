"use strict";
exports.__esModule = true;
exports.dbSOption = exports.db_servers = exports.customDbServer = exports.dbServerAddress = exports.dbServer = exports.faVersion = exports.anSOption = exports.an_servers = exports.customAnalysisServer = exports.anServerAddress = exports.analysisServer = exports.formDataFromDict = exports.jsonEscapeUTF = void 0;
var cookieStore_1 = require("$lib/utils/cookieStore");
var store_1 = require("svelte/store");
var environment_1 = require("$app/environment");
var axios_1 = require("axios");
var user_1 = require("$lib/stores/user");
// The rest is all logic to handle the selection of analysis and db server addesses
function jsonEscapeUTF(s) {
    return s.replace(/[^\x20-\x7F]/g, function (x) { return '\\u' + ('000' + x.codePointAt(0).toString(16)).slice(-4); });
}
exports.jsonEscapeUTF = jsonEscapeUTF;
function formDataFromDict(data) {
    var fd = new FormData();
    Object.entries(data).forEach(function (_a) {
        var k = _a[0], v = _a[1];
        fd.append(k, v);
    });
    return fd;
}
exports.formDataFromDict = formDataFromDict;
exports.anServerAddress = store_1.writable();
exports.customAnalysisServer = cookieStore_1.newCookieStore('customAnalysisServer', 'http://localhost:5000');
exports.an_servers = {
    uk: 'https://flightcoachscore.org:5010',
    pre: 'https://flightcoachscore.org:5020'
};
exports.anSOption = cookieStore_1.newCookieStore('anSOption', 'uk', function (value) {
    var _a;
    if (environment_1.dev || ((_a = store_1.get(user_1.user)) === null || _a === void 0 ? void 0 : _a.is_superuser)) {
        if (Object.keys(exports.an_servers).includes(value)) {
            exports.anServerAddress.set(exports.an_servers[value]);
        }
        else {
            exports.anServerAddress.set(store_1.get(exports.customAnalysisServer));
        }
    }
    else {
        exports.anServerAddress.set(exports.an_servers.uk);
    }
});
exports.customAnalysisServer.subscribe(function (value) {
    if (store_1.get(exports.anSOption) == 'custom') {
        exports.anServerAddress.set(value);
    }
});
exports.faVersion = store_1.writable(undefined);
exports.anServerAddress.subscribe(function (value) {
    exports.analysisServer = axios_1["default"].create({
        baseURL: value
    });
    exports.analysisServer
        .get('fa_version')
        .then(function (res) { return exports.faVersion.set(res.data); })["catch"](function () { return exports.faVersion.set(undefined); });
});
exports.dbServerAddress = store_1.writable();
exports.customDbServer = cookieStore_1.newCookieStore('customDbServer', 'http://localhost:8000');
exports.db_servers = {
    uk: 'https://flightcoachscore.org:5012',
    pre: 'https://flightcoachscore.org:5022'
};
exports.dbSOption = cookieStore_1.newCookieStore('dbSOption', 'uk', function (value) {
    var _a;
    if (environment_1.dev || ((_a = store_1.get(user_1.user)) === null || _a === void 0 ? void 0 : _a.is_superuser)) {
        if (Object.keys(exports.db_servers).includes(value)) {
            exports.dbServerAddress.set(exports.db_servers[value]);
        }
        else {
            exports.dbServerAddress.set(store_1.get(exports.customDbServer));
        }
    }
    else {
        exports.dbServerAddress.set(exports.db_servers.uk);
    }
});
exports.customDbServer.subscribe(function (value) {
    if (store_1.get(exports.dbSOption) == 'custom') {
        exports.dbServerAddress.set(value);
    }
});
exports.dbServerAddress.subscribe(function (value) {
    exports.dbServer = axios_1["default"].create({
        baseURL: value,
        withCredentials: true
    });
});
if (!environment_1.dev) {
    exports.anSOption.set('uk');
    exports.dbSOption.set('uk');
}
