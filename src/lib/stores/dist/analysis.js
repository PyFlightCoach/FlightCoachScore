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
exports.isComplete = exports.selManID = exports.truncate = exports.difficulty = exports.selectedResult = exports.fa_versions = exports.totalScore = exports.scores = exports.runInfo = exports.nRunning = exports.running = exports.analyses = exports.nMans = exports.manNames = exports.updateSplits = exports.manSplits = exports.isFullSize = exports.states = exports.fcj = exports.origin = exports.bootTime = exports.binData = exports.bin = exports.isCompFlight = void 0;
var store_1 = require("svelte/store");
var fcjson_1 = require("$lib/analysis/fcjson");
var store_2 = require("svelte/store");
var splitting_1 = require("$lib/analysis/splitting");
var schedules_1 = require("$lib/schedules/library");
exports.isCompFlight = store_1.writable(true);
exports.bin = store_1.writable();
exports.binData = store_1.writable();
exports.bootTime = store_1.writable();
exports.origin = store_1.writable(fcjson_1.Origin.load());
exports.fcj = store_1.writable();
exports.states = store_1.writable();
exports.isFullSize = store_1.writable(false);
exports.states.subscribe(function (sts) {
    exports.isFullSize.set(sts ? Math.max(sts.range('z'), sts.range('x'), sts.range('y')) > 1000 : false);
});
exports.manSplits = store_1.writable([splitting_1.takeOff()]);
function updateSplits(_fcj, force) {
    if (force === void 0) { force = false; }
    return __awaiter(this, void 0, Promise, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(force || store_2.get(exports.manSplits).length <= 1)) return [3 /*break*/, 2];
                    return [4 /*yield*/, splitting_1.parseFCJMans(_fcj, store_2.get(exports.states)).then(function (mans) { return __awaiter(_this, void 0, void 0, function () {
                            var oMans, _loop_1, _i, mans_1, man;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        oMans = [];
                                        _loop_1 = function (man) {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!man.manoeuvre) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, schedules_1.loadManDef(man.manoeuvre.id).then(function (md) {
                                                                man.mdef = md;
                                                            })];
                                                    case 1:
                                                        _a.sent();
                                                        _a.label = 2;
                                                    case 2:
                                                        oMans.push(man);
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _i = 0, mans_1 = mans;
                                        _a.label = 1;
                                    case 1:
                                        if (!(_i < mans_1.length)) return [3 /*break*/, 4];
                                        man = mans_1[_i];
                                        return [5 /*yield**/, _loop_1(man)];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 4:
                                        exports.manSplits.set(oMans);
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, store_2.get(exports.manSplits)];
            }
        });
    });
}
exports.updateSplits = updateSplits;
exports.manNames = store_1.writable();
exports.nMans = store_1.derived(exports.manNames, function (mns) { return (mns === null || mns === void 0 ? void 0 : mns.length) || 0; });
exports.analyses = [];
exports.running = store_1.writable([]);
exports.nRunning = store_1.derived(exports.running, function (rn) {
    var nR = 0;
    rn.forEach(function (v) { return (nR += v ? 1 : 0); });
    return nR;
});
exports.runInfo = [];
exports.scores = store_1.writable();
exports.totalScore = store_1.writable('---');
exports.fa_versions = store_1.writable([]);
exports.fa_versions.subscribe(function (value) {
    if (value.length > 0) {
        exports.selectedResult.set(value[value.length - 1]);
    }
});
exports.selectedResult = store_1.writable();
exports.difficulty = store_1.writable(3);
exports.truncate = store_1.writable(false);
exports.selManID = store_1.writable();
exports.scores.subscribe(function (value) {
    exports.totalScore.set(value ? value.reduce(function (a, b) { return a + b; }, 0).toFixed(2) : '---');
});
function updateScores(result, diff, trunc) {
    if (result) {
        var _scores_1 = [];
        exports.analyses.forEach(function (a, i) {
            var _a;
            var ma = store_2.get(a);
            _scores_1.push(ma ? ma.get_score(result, diff, trunc).total * (((_a = ma.mdef) === null || _a === void 0 ? void 0 : _a.info.k) | ma.k) : 0);
        });
        exports.scores.set(_scores_1);
    }
}
exports.selectedResult.subscribe(function (value) {
    updateScores(value, store_2.get(exports.difficulty), store_2.get(exports.truncate));
});
exports.difficulty.subscribe(function (value) {
    updateScores(store_2.get(exports.selectedResult), value, store_2.get(exports.truncate));
});
exports.truncate.subscribe(function (value) {
    updateScores(store_2.get(exports.selectedResult), store_2.get(exports.difficulty), value);
});
exports.isComplete = store_1.writable(false);
