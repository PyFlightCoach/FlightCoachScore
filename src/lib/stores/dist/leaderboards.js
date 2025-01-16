"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.updateTable = exports.postUploadSearch = exports.getNFlights = exports.getDays = exports.lastResponse = exports.table_rows = exports.includeActive = exports.includeMyLatest = exports.includeMyBest = exports.version = exports.date_before = exports.date_after = exports.select_by_date = exports.manoeuvre_ind = exports.singleman = exports.sort_by_score_flag = exports.one_per_pilot_flag = exports.schedule_id = exports.truncate = exports.difficulty = exports.me_only_flag = exports.n_days_val = exports.n_results = void 0;
var cookieStore_1 = require("$lib/utils/cookieStore");
var store_1 = require("svelte/store");
var api_1 = require("$lib/api");
var store_2 = require("svelte/store");
var api_2 = require("$lib/api");
var user_1 = require("$lib/stores/user");
var shared_1 = require("$lib/stores/shared");
exports.n_results = cookieStore_1.newCookieStoreInt('n_results', 10);
exports.n_days_val = cookieStore_1.newCookieStoreInt('search_n_days', 30);
exports.me_only_flag = cookieStore_1.newCookieStoreBool('me_only_flag', false);
exports.difficulty = cookieStore_1.newCookieStoreInt('difficulty', 3);
exports.truncate = cookieStore_1.newCookieStoreBool('truncate', false);
exports.schedule_id = cookieStore_1.newCookieStore('schedule_id', '');
exports.one_per_pilot_flag = cookieStore_1.newCookieStoreBool('one_per_pilot_flag', true);
exports.sort_by_score_flag = cookieStore_1.newCookieStoreBool('sort_by_score_flag', true);
exports.singleman = cookieStore_1.newCookieStoreBool('singleman', false);
exports.manoeuvre_ind = cookieStore_1.newCookieStoreInt('manoeuvre_index', 1);
exports.select_by_date = cookieStore_1.newCookieStoreBool('select_by_date', false);
exports.date_after = cookieStore_1.newCookieStore('date_after', '');
exports.date_before = cookieStore_1.newCookieStore('date_before', '');
exports.version = store_1.writable(store_2.get(api_1.faVersion));
exports.includeMyBest = cookieStore_1.newCookieStoreInt('includeMyBest', 0);
exports.includeMyLatest = cookieStore_1.newCookieStoreInt('includeMyLatest', 0);
exports.includeActive = cookieStore_1.newCookieStoreInt('includeActive', 0);
exports.table_rows = store_1.writable([]);
exports.lastResponse = store_1.writable();
function getDays(ndval) {
    return { 0: 1, 370: 720, 380: 10000 }[ndval] || ndval;
}
exports.getDays = getDays;
function getNFlights(nfval) {
    return { 101: 200, 102: 1000 }[nfval] || nfval;
}
exports.getNFlights = getNFlights;
exports.postUploadSearch = function () {
    var fl = store_2.get(shared_1.activeFlight);
    exports.select_by_date.set(false);
    exports.n_days_val.set(380);
    exports.schedule_id.set(fl.meta.schedule_id || '');
    exports.sort_by_score_flag.set(true);
    exports.version.set(store_2.get(api_1.faVersion));
    exports.includeActive.set(3);
    exports.updateTable();
};
exports.updateTable = function () { return __awaiter(void 0, void 0, void 0, function () {
    var q, _method;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                q = __assign(__assign(__assign(__assign(__assign({
                    n_results: getNFlights(store_2.get(exports.n_results)),
                    me_only_flag: store_2.get(exports.me_only_flag),
                    difficulty: store_2.get(exports.difficulty),
                    truncate: store_2.get(exports.truncate),
                    schedule_id: store_2.get(exports.schedule_id),
                    one_per_pilot_flag: store_2.get(exports.sort_by_score_flag) ? store_2.get(exports.one_per_pilot_flag) : false,
                    version: store_2.get(exports.version)
                }, (store_2.get(exports.singleman) ? { manoeuvre_ind: store_2.get(exports.manoeuvre_ind) } : {})), (store_2.get(exports.sort_by_score_flag) && store_2.get(exports.includeMyBest) ? { include_my_best: store_2.get(exports.includeMyBest) - 1 } : {})), (store_2.get(exports.sort_by_score_flag) && store_2.get(exports.includeMyLatest) ? { include_my_latest: store_2.get(exports.includeMyLatest) - 1 } : {})), (store_2.get(exports.sort_by_score_flag) && store_2.get(exports.includeActive) && ((_a = store_2.get(shared_1.activeFlight)) === null || _a === void 0 ? void 0 : _a.isMine) ? { include_my_flight_id: ((_b = store_2.get(shared_1.activeFlight)) === null || _b === void 0 ? void 0 : _b.meta.flight_id) + "+" + (store_2.get(exports.includeActive) - 1) } : {})), (store_2.get(exports.select_by_date) ? { date_after: store_2.get(exports.date_after), date_before: store_2.get(exports.date_before) } : { n_days: getDays(store_2.get(exports.n_days_val)) }));
                console.debug(q);
                _method = store_2.get(exports.sort_by_score_flag) ? 'leaderboard' : 'flightlist';
                return [4 /*yield*/, user_1.checkUser()];
            case 1:
                if (_c.sent()) {
                    api_2.dbServer.get('analysis/' + _method + '?' + new URLSearchParams(q).toString()).then(function (res) {
                        exports.table_rows.set(res.data.results.map(function (row) {
                            return __assign(__assign({}, row), { score: Math.round(row.score * 100) / 100 });
                        }));
                    })["catch"](function (e) { console.error(e); });
                    exports.lastResponse.set(_method);
                }
                return [2 /*return*/];
        }
    });
}); };
