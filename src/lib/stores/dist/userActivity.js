"use strict";
exports.__esModule = true;
exports.request_activity = exports.userActivity = void 0;
var store_1 = require("svelte/store");
var api_1 = require("$lib/api");
var user_1 = require("$lib/stores/user");
var schedules_1 = require("$lib/schedules");
exports.userActivity = store_1.writable([]);
exports.request_activity = function () {
    api_1.dbServer
        .get('/analysis/user_activity')
        .then(function (res) {
        exports.userActivity.set(res.data.results);
    })["catch"](function (err) {
        exports.userActivity.set([]);
        console.log(err);
    });
};
user_1.user.subscribe(exports.request_activity);
schedules_1.library.subscribe(exports.request_activity);
