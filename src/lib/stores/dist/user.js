"use strict";
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
exports.checkUser = exports.user = void 0;
var store_1 = require("svelte/store");
var store_2 = require("svelte/store");
var api_1 = require("$lib/api");
var navigation_1 = require("$app/navigation");
var paths_1 = require("$app/paths");
exports.user = store_1.writable();
var userCheckInterval = store_1.writable();
function checkUser() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.dbServer
                    .get('users/me')
                    .then(function (res) {
                    var me = res.data;
                    exports.user.set(me);
                    if (me.is_verified) {
                        return true;
                    }
                    else {
                        if (confirm('Please verify your email address first. Resend verification email?')) {
                            navigation_1.goto(paths_1.base + '/user/verify-request/?email=' + me.email);
                        }
                        return false;
                    }
                })["catch"](function () {
                    exports.user.set(undefined);
                    if (confirm('Your session has expired. Log in again?')) {
                        navigation_1.goto(paths_1.base + '/user/login');
                    }
                    return false;
                })];
        });
    });
}
exports.checkUser = checkUser;
exports.user.subscribe(function (value) {
    if (store_2.get(userCheckInterval)) {
        clearInterval(store_2.get(userCheckInterval));
    }
    if (value) {
        userCheckInterval.set(setInterval(function () {
            api_1.dbServer
                .get('users/me')
                .then(function (me) {
                console.debug(me.data.first_name + " " + me.data.last_name + " still logged in");
            })["catch"](function () {
                console.log('User logged out');
                exports.user.set(undefined);
            });
        }, 1000 * 60));
    }
});
