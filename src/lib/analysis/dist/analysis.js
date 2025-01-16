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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.analyseManoeuvre = exports.analyseAll = exports.analyseMans = exports.loadAnalysisFromDB = exports.loadExample = exports.importAnalysis = exports.exportAnalysis = exports.createAnalysisExport = exports.newAnalysis = exports.clearDataLoading = exports.clearAnalysis = exports.checkComplete = void 0;
var sts = require("$lib/stores/analysis");
var shared_1 = require("$lib/stores/shared");
var ma_1 = require("$lib/analysis/ma");
var store_1 = require("svelte/store");
var api_1 = require("$lib/api");
var state_1 = require("$lib/analysis/state");
var splitting_1 = require("$lib/analysis/splitting");
var fcjson_1 = require("./fcjson");
var schedules_1 = require("$lib/schedules");
var api_2 = require("$lib/api");
var jszip_1 = require("jszip");
var navigation_1 = require("$app/navigation");
var paths_1 = require("$app/paths");
var flight_1 = require("$lib/database/flight");
var splitting_2 = require("$lib/analysis/splitting");
var fcjson_2 = require("$lib/analysis/fcjson");
function checkComplete() {
    var _a;
    return Boolean(((_a = store_1.get(sts.manNames)) === null || _a === void 0 ? void 0 : _a.length) &&
        sts.analyses.every(function (a) { var _a, _b, _c; return store_1.get(a) && ((_c = (_b = (_a = store_1.get(a)) === null || _a === void 0 ? void 0 : _a.history[store_1.get(api_1.faVersion)]) === null || _b === void 0 ? void 0 : _b.results) === null || _c === void 0 ? void 0 : _c.length); }));
}
exports.checkComplete = checkComplete;
function setupAnalysisArrays(mnames) {
    sts.manNames.set(mnames);
    sts.scores.set(new Array(mnames.length).fill(0));
    sts.running.set(new Array(mnames.length).fill(false));
    sts.analyses.length = mnames.length;
    sts.runInfo.length = mnames.length;
    mnames.forEach(function (_, i) {
        sts.runInfo[i] = store_1.writable();
        sts.analyses[i] = store_1.writable();
    });
}
function setAnalysis(i, man) {
    sts.analyses[i].set(man);
    sts.analyses[i].subscribe(function (ma) {
        sts.scores.update(function (s) {
            var _a;
            if (ma) {
                s[i] =
                    ma.get_score(store_1.get(sts.selectedResult), store_1.get(sts.difficulty), store_1.get(sts.truncate)).total *
                        (((_a = ma.mdef) === null || _a === void 0 ? void 0 : _a.info.k) || ma.k);
            }
            else {
                s[i] = 0;
            }
            return s;
        });
        sts.fa_versions.update(function (v) {
            return __spreadArrays(new Set(__spreadArrays(v, Object.keys((ma === null || ma === void 0 ? void 0 : ma.history) || []))));
        });
        sts.isComplete.set(checkComplete());
    });
}
function clearAnalysis() {
    console.log('clearing analysis');
    shared_1.activeFlight.set(undefined);
    sts.selManID.set(undefined);
    sts.manNames.set(undefined);
    sts.scores.set(undefined);
    sts.selectedResult.set(undefined);
    sts.fa_versions.set([]);
    sts.analyses.length = 0;
    sts.running.set([]);
    sts.runInfo.length = 0;
    shared_1.activeFlight.set(undefined);
    shared_1.isAnalysisModified.set(undefined);
}
exports.clearAnalysis = clearAnalysis;
function clearDataLoading() {
    console.log('clearing data loading');
    sts.states.set(undefined);
    sts.binData.set(undefined);
    sts.bootTime.set(undefined);
    sts.origin.set(fcjson_2.Origin.load());
    sts.fcj.set(undefined);
    sts.bin.set(undefined);
    sts.manSplits.set([splitting_2.takeOff()]);
    shared_1.dataSource.set(undefined);
    clearAnalysis();
}
exports.clearDataLoading = clearDataLoading;
sts.manSplits.subscribe(function () {
    clearAnalysis();
});
function newAnalysis(states, split) {
    return __awaiter(this, void 0, void 0, function () {
        var direction, ddef, heading;
        var _this = this;
        return __generator(this, function (_a) {
            setupAnalysisArrays(split.manNames);
            shared_1.isAnalysisModified.set(false);
            if (store_1.get(sts.binData)) {
                sts.origin.update(function (orgn) {
                    return Object.assign(orgn, orgn.noMove());
                });
            }
            direction = 'Infer';
            if (store_1.get(sts.isCompFlight)) {
                ddef = split.directionDefinition();
                heading = states.data[split.mans[ddef.manid - 1].stop].direction_str();
                if (ddef.direction == 'DOWNWIND') {
                    direction = heading == 'RTOL' ? 'LTOR' : 'RTOL';
                }
                else if (ddef.direction == 'UPWIND') {
                    direction = heading == 'RTOL' ? 'RTOL' : 'LTOR';
                }
                else {
                    throw new Error("Invalid direction definition " + ddef.direction);
                }
            }
            split.analysisMans.forEach(function (id, i) { return __awaiter(_this, void 0, void 0, function () {
                var sch;
                var _a;
                return __generator(this, function (_b) {
                    sts.runInfo[i].set("New Analysis Created At " + new Date().toLocaleTimeString());
                    sch = splitting_1.schedule(split.mans[id]);
                    setAnalysis(i, new ma_1.MA(split.mans[id].manoeuvre.short_name, id, id > 0 ? states.data[split.mans[id - 1].stop].t : 0, states.data[split.mans[id].stop].t, new fcjson_1.ScheduleInfo(sch.category_name, sch.schedule_name), direction, ((_a = store_1.get(sts.fcj)) === null || _a === void 0 ? void 0 : _a.manhistory(id)) || {}, split.mans[id].manoeuvre.k, // todo get K
                    store_1.get(sts.binData)
                        ? undefined
                        : new state_1.States(states.data.slice(split.mans[id - 1].stop, split.mans[id].stop)), split.mans[id].mdef));
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    });
}
exports.newAnalysis = newAnalysis;
function createAnalysisExport(small) {
    var _a, _b, _c;
    if (small === void 0) { small = false; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_d) {
            return [2 /*return*/, {
                    origin: store_1.get(sts.origin),
                    isComp: store_1.get(sts.isCompFlight),
                    sourceBin: ((_a = store_1.get(sts.bin)) === null || _a === void 0 ? void 0 : _a.name) || undefined,
                    sourceFCJ: ((_b = store_1.get(sts.fcj)) === null || _b === void 0 ? void 0 : _b.name) || undefined,
                    bootTime: ((_c = store_1.get(sts.bootTime)) === null || _c === void 0 ? void 0 : _c.toISOString()) || undefined,
                    mans: sts.analyses.map(function (_ma) { return (small ? store_1.get(_ma).shortExport() : store_1.get(_ma).longExport()); })
                }];
        });
    });
}
exports.createAnalysisExport = createAnalysisExport;
function exportAnalysis(small) {
    if (small === void 0) { small = false; }
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = Blob.bind;
                    _c = (_b = JSON).stringify;
                    return [4 /*yield*/, createAnalysisExport(small)];
                case 1: return [2 /*return*/, new (_a.apply(Blob, [void 0, [_c.apply(_b, [_d.sent(), null, 2])], {
                            type: 'application/json'
                        }]))()];
            }
        });
    });
}
exports.exportAnalysis = exportAnalysis;
function importAnalysis(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            clearDataLoading();
            sts.origin.set(data.origin);
            sts.isCompFlight.set(data.isComp);
            sts.bootTime.set(data.bootTime ? new Date(Date.parse(data.bootTime)) : undefined);
            setupAnalysisArrays(data.mans.map(function (ma) { return ma.name; }));
            data.mans.forEach(function (ma, i) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    sts.runInfo[i].set("Imported Analysis at " + new Date().toLocaleTimeString());
                    ma_1.MA.parse(ma).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                        var mdef;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!res.mdef) return [3 /*break*/, 1];
                                    setAnalysis(i, res);
                                    return [3 /*break*/, 3];
                                case 1: return [4 /*yield*/, schedules_1.loadManDef(store_1.get(schedules_1.library).subset({
                                        category_name: res.schedule.category,
                                        schedule_name: res.schedule.name
                                    }).first.manoeuvres[res.id - 1].id)];
                                case 2:
                                    mdef = _a.sent();
                                    setAnalysis(i, new ma_1.MA(res.name, res.id, res.tStart, res.tStop, res.schedule, res.scheduleDirection, res.history, mdef.info.k, res.flown, mdef));
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    });
}
exports.importAnalysis = importAnalysis;
function loadExample() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api_1.analysisServer
                        .get('example', shared_1.blockProgress('Downloading Example'))
                        .then(function (res) {
                        importAnalysis(res.data);
                        shared_1.dataSource.set('example');
                    })["finally"](shared_1.unblockProgress)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.loadExample = loadExample;
function loadAnalysisFromDB(flight_id) {
    return __awaiter(this, void 0, void 0, function () {
        var zip;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    zip = new jszip_1["default"]();
                    shared_1.loading.set(true);
                    return [4 /*yield*/, api_2.dbServer
                            .get("flight/ajson/" + flight_id, __assign({ responseType: 'arraybuffer' }, shared_1.blockProgress('Loading Analysis from Database')))
                            .then(function (response) { return zip.loadAsync(response.data); })
                            .then(function (res) { return Object.values(res.files)[0].async('string'); })
                            .then(function (ajson) { return JSON.parse(ajson); })
                            .then(importAnalysis)
                            .then(function () { return flight_1.Flight.load(flight_id); })
                            .then(function (flight) {
                            shared_1.dataSource.set('db');
                            shared_1.activeFlight.set(flight);
                            navigation_1.goto(paths_1.base + "/flight/results");
                        })["finally"](function () { shared_1.unblockProgress(); shared_1.loading.set(false); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.loadAnalysisFromDB = loadAnalysisFromDB;
function analyseMans(ids) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            ids.forEach(function (id) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, analyseManoeuvre(id)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
exports.analyseMans = analyseMans;
function analyseAll(force, optimise) {
    if (force === void 0) { force = false; }
    if (optimise === void 0) { optimise = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            sts.analyses.forEach(function (ma, i) {
                analyseManoeuvre(i, force, optimise);
            });
            return [2 /*return*/];
        });
    });
}
exports.analyseAll = analyseAll;
function analyseManoeuvre(id, force, optimise) {
    if (force === void 0) { force = false; }
    if (optimise === void 0) { optimise = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        var ma, isReRun;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ma = store_1.get(sts.analyses[id]);
                    isReRun = Object.keys(ma.history).includes(store_1.get(api_1.faVersion));
                    if (optimise === undefined) {
                        optimise = !isReRun;
                    } //optimise if for new analysis version
                    if (!((!ma.scores || optimise || force) && !store_1.get(sts.running)[id])) return [3 /*break*/, 2];
                    //if scores exist, only run if server version not in history
                    sts.runInfo[id].set("Running analysis at " + new Date().toLocaleTimeString());
                    sts.running.update(function (v) {
                        v[id] = true;
                        return v;
                    });
                    return [4 /*yield*/, ma.run(optimise).then(function (res) {
                            sts.analyses[id].set(res);
                            sts.running.update(function (v) {
                                v[id] = false;
                                return v;
                            });
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.analyseManoeuvre = analyseManoeuvre;
