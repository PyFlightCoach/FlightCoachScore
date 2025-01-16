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
exports.parseFCJMans = exports.Splitting = exports.next = exports.addManDef = exports.schedule = exports.empty = exports.landing = exports.sequence_break = exports.takeOff = exports.build = void 0;
var arrays_1 = require("$lib/utils/arrays");
var schedules_1 = require("$lib/schedules");
var store_1 = require("svelte/store");
var leaderboards_1 = require("$lib/stores/leaderboards");
function build(category_name, schedule_name, manoeuvre, stop, fixed, alternate_name) {
    if (category_name === void 0) { category_name = undefined; }
    if (schedule_name === void 0) { schedule_name = undefined; }
    if (manoeuvre === void 0) { manoeuvre = undefined; }
    if (stop === void 0) { stop = undefined; }
    if (fixed === void 0) { fixed = false; }
    if (alternate_name === void 0) { alternate_name = undefined; }
    return {
        category_name: category_name,
        schedule_name: schedule_name,
        manoeuvre: manoeuvre,
        stop: stop,
        fixed: fixed,
        alternate_name: alternate_name
    };
}
exports.build = build;
function takeOff(stop) {
    if (stop === void 0) { stop = undefined; }
    return { fixed: true, stop: stop, alternate_name: 'TakeOff' };
}
exports.takeOff = takeOff;
function sequence_break(stop) {
    if (stop === void 0) { stop = undefined; }
    return { stop: stop, alternate_name: 'Break' };
}
exports.sequence_break = sequence_break;
function landing(stop) {
    if (stop === void 0) { stop = undefined; }
    return { stop: stop, alternate_name: 'Landing' };
}
exports.landing = landing;
function empty(stop) {
    if (stop === void 0) { stop = undefined; }
    return { stop: stop };
}
exports.empty = empty;
function schedule(split) {
    return store_1.get(schedules_1.library).subset({
        category_name: split.category_name,
        schedule_name: split.schedule_name
    }).first;
}
exports.schedule = schedule;
function addManDef(split) {
    if (split.manoeuvre) {
        var mdef = schedules_1.loadManDef(split.manoeuvre.id);
        return Object.assign({}, split, { mdef: mdef });
    }
    else {
        return split;
    }
}
exports.addManDef = addManDef;
function next(last, stop) {
    if (stop === void 0) { stop = undefined; }
    var msBase = empty(stop);
    if (store_1.get(leaderboards_1.schedule_id) && !last.manoeuvre) {
        var last_schedule = store_1.get(schedules_1.library).subset({ schedule_id: store_1.get(leaderboards_1.schedule_id) }).first;
        if (last_schedule) {
            msBase.category_name = last_schedule.category_name;
            msBase.schedule_name = last_schedule.schedule_name;
            msBase.manoeuvre = last_schedule.manoeuvres[0];
        }
    }
    switch (last.alternate_name) {
        case undefined:
            if (last.category_name && last.schedule_name && last.manoeuvre) {
                var mans = schedule(last).manoeuvres;
                if (last.manoeuvre.index < mans.length) {
                    return __assign(__assign({}, last), {
                        manoeuvre: mans[last.manoeuvre.index],
                        stop: stop
                    });
                }
                else {
                    return landing(stop);
                }
            }
            else {
                throw new Error('Cannot make next manoeuvre without fully defining previous');
            }
        case 'Landing':
            throw new Error('Landing must be the last manoeuvre');
        case 'TakeOff':
        case 'Break':
            return msBase;
    }
}
exports.next = next;
var Splitting = /** @class */ (function () {
    function Splitting(mans) {
        this.mans = mans;
    }
    Object.defineProperty(Splitting.prototype, "analysisMans", {
        get: function () {
            var oMans = [];
            this.mans.forEach(function (man, i) {
                if (man.manoeuvre) {
                    oMans.push(i);
                }
            });
            return oMans;
        },
        enumerable: false,
        configurable: true
    });
    Splitting.prototype.directionDefinition = function () {
        var ddef;
        var imans = this.analysisMans;
        for (var i = 0; i < imans.length; i++) {
            if (this.mans[imans[i]].mdef.info.start.direction != 'CROSS') {
                ddef = { direction: this.mans[imans[i]].mdef.info.start.direction, manid: imans[i] };
                break;
            }
        }
        return ddef;
    };
    Object.defineProperty(Splitting.prototype, "manNames", {
        get: function () {
            var _this = this;
            return this.analysisMans.map(function (iman) { return _this.mans[iman].manoeuvre.short_name; });
        },
        enumerable: false,
        configurable: true
    });
    return Splitting;
}());
exports.Splitting = Splitting;
function parseFCJMans(fcj, states) {
    return __awaiter(this, void 0, void 0, function () {
        var stTime, sinfo, schedule;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stTime = states.t;
                    return [4 /*yield*/, fcj.sinfo.to_pfc()];
                case 1:
                    sinfo = _a.sent();
                    schedule = store_1.get(schedules_1.library).subset({ category_name: sinfo.category, schedule_name: sinfo.name }).first;
                    return [2 /*return*/, fcj.mans.map(function (man, i) {
                            var stStop = arrays_1.lookupMonotonic(fcj.data[man.stop].time / 1e6, stTime);
                            switch (i) {
                                case 0:
                                    return takeOff(stStop);
                                case fcj.mans.length - 1:
                                    return landing(stTime.length);
                                default:
                                    return build(schedule.category_name, schedule.schedule_name, schedule.manoeuvres[i - 1], stStop);
                            }
                        })];
            }
        });
    });
}
exports.parseFCJMans = parseFCJMans;
