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
exports.ManOptionHandler = exports.ManoeuvreHandler = exports.safeGetLibrary = exports.loadManDef = exports.loadKnowns = exports.library = exports.ScheduleLibrary = exports.loadSchedules = exports.scheduleRepr = void 0;
var api_1 = require("$lib/api");
var mandef_1 = require("$lib/analysis/mandef");
var store_1 = require("svelte/store");
var store_2 = require("svelte/store");
var manoeuvre_1 = require("$lib/analysis/manoeuvre");
var state_1 = require("$lib/analysis/state");
var aresti_1 = require("$lib/analysis/aresti");
function scheduleRepr(s) {
    if (!s) {
        return 'Select Schedule';
    }
    else {
        return s.category_name + " " + s.schedule_name;
    }
}
exports.scheduleRepr = scheduleRepr;
function loadSchedules(request) {
    return __awaiter(this, void 0, Promise, function () {
        var schedules;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api_1.dbServer.get("schedule/schedules", request)];
                case 1:
                    schedules = _a.sent();
                    return [2 /*return*/, schedules.data.results];
            }
        });
    });
}
exports.loadSchedules = loadSchedules;
var ScheduleLibrary = /** @class */ (function () {
    function ScheduleLibrary(schedules) {
        if (schedules === void 0) { schedules = []; }
        this.schedules = schedules;
    }
    Object.defineProperty(ScheduleLibrary.prototype, "length", {
        get: function () {
            return this.schedules.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScheduleLibrary.prototype, "first", {
        get: function () {
            return this.schedules[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScheduleLibrary.prototype, "only", {
        get: function () {
            if (this.schedules.length !== 1) {
                throw new Error('ScheduleLibrary.only: ScheduleLibrary does not contain exactly one schedule');
            }
            return this.schedules[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScheduleLibrary.prototype, "empty", {
        get: function () {
            return this.schedules.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    ScheduleLibrary.prototype.downselect = function (ids) {
        return new ScheduleLibrary(this.schedules.filter(function (s) { return ids.includes(s.schedule_id); }));
    };
    ScheduleLibrary.prototype.unique = function (key) {
        return Array.from(new Set(this.schedules.map(function (s) { return s[key]; })));
    };
    ScheduleLibrary.prototype.subset = function (conditions) {
        var checkConditions = function (s) {
            for (var key in conditions) {
                if (s[key] !== conditions[key]) {
                    return false;
                }
            }
            return true;
        };
        return new ScheduleLibrary(this.schedules.filter(checkConditions));
    };
    ScheduleLibrary.prototype.append = function (schedules) {
        var lib = new ScheduleLibrary(this.schedules.concat(schedules));
        var unique_ids = lib.unique('schedule_id');
        return new ScheduleLibrary(unique_ids.map(function (id) { return lib.subset({ schedule_id: id }).first; }));
    };
    ScheduleLibrary.prototype.update = function (request) {
        return __awaiter(this, void 0, Promise, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.append;
                        return [4 /*yield*/, loadSchedules(request)];
                    case 1: return [2 /*return*/, _a.apply(this, [_b.sent()])];
                }
            });
        });
    };
    ScheduleLibrary.prototype.sort = function (keys) {
        var sortFunction = function (a, b) {
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                if (a[key] < b[key]) {
                    return -1;
                }
                else if (a[key] > b[key]) {
                    return 1;
                }
            }
            return 0;
        };
        return new ScheduleLibrary(this.schedules.sort(sortFunction));
    };
    return ScheduleLibrary;
}());
exports.ScheduleLibrary = ScheduleLibrary;
exports.library = store_1.writable(new ScheduleLibrary());
function loadKnowns() {
    return __awaiter(this, void 0, void 0, function () {
        var lib;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("loading knowns");
                    lib = store_2.get(exports.library);
                    if (!lib.subset({ owner_name: 'Fcscore Admin' }).empty) return [3 /*break*/, 2];
                    return [4 /*yield*/, lib.update({ owner: 'admin@fcscore.org' }).then(function (newlib) {
                            exports.library.set(newlib.sort(['rule_name', 'category_name', 'schedule_name']));
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.loadKnowns = loadKnowns;
api_1.dbServerAddress.subscribe(loadKnowns);
function loadManDef(manoeuvre_id) {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, api_1.dbServer
                    .get("schedule/manoeuvre/definition/" + manoeuvre_id)
                    .then(function (r) { return mandef_1.ManDef.parse(r.data); })];
        });
    });
}
exports.loadManDef = loadManDef;
function safeGetLibrary() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadKnowns()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, store_2.get(exports.library)];
            }
        });
    });
}
exports.safeGetLibrary = safeGetLibrary;
var ManoeuvreHandler = /** @class */ (function () {
    function ManoeuvreHandler(aresti, olan, definition, manoeuvre, template) {
        if (olan === void 0) { olan = undefined; }
        if (definition === void 0) { definition = undefined; }
        if (manoeuvre === void 0) { manoeuvre = undefined; }
        if (template === void 0) { template = undefined; }
        this.template = undefined;
        this.aresti = aresti;
        this.olan = olan;
        this.definition = definition;
        this.manoeuvre = manoeuvre;
        this.template = template;
    }
    ManoeuvreHandler.parseOlan = function (data) {
        return new ManoeuvreHandler(data.aresti, data.olan, mandef_1.ManDef.parse(data.definition), manoeuvre_1.Manoeuvre.parse(data.manoeuvre), state_1.States.parse(data.template));
    };
    ManoeuvreHandler.parseDB = function (manoeuvre_id) {
        return __awaiter(this, void 0, void 0, function () {
            var aresti, _a, _b, definition, _c, _d, res;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _b = (_a = aresti_1.Figure).parse;
                        return [4 /*yield*/, api_1.dbServer.get("schedule/manoeuvre/aresti/" + manoeuvre_id)];
                    case 1:
                        aresti = _b.apply(_a, [(_e.sent()).data]);
                        _d = (_c = mandef_1.ManDef).parse;
                        return [4 /*yield*/, api_1.dbServer.get("schedule/manoeuvre/definition/" + manoeuvre_id)];
                    case 2:
                        definition = _d.apply(_c, [(_e.sent()).data]);
                        return [4 /*yield*/, api_1.analysisServer.post('create_template', { mdef: definition })];
                    case 3:
                        res = (_e.sent()).data;
                        if (Array.isArray(aresti)) {
                            return [2 /*return*/, new ManOptionHandler(aresti.map(function (a, i) {
                                    return new ManoeuvreHandler(a, undefined, definition.options[i], manoeuvre_1.Manoeuvre.parse(res[i].manoeuvre), state_1.States.parse(res[i].template));
                                }))];
                        }
                        else {
                            return [2 /*return*/, new ManoeuvreHandler(aresti, undefined, definition, manoeuvre_1.Manoeuvre.parse(res[0].manoeuvre), state_1.States.parse(res[0].template))];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ManoeuvreHandler.empty = function (short_name) {
        return new ManoeuvreHandler(new aresti_1.Figure(new mandef_1.ManInfo(short_name)));
    };
    return ManoeuvreHandler;
}());
exports.ManoeuvreHandler = ManoeuvreHandler;
var ManOptionHandler = /** @class */ (function () {
    function ManOptionHandler(options) {
        this.options = options;
        this.active = 0;
        this.options = options;
    }
    Object.defineProperty(ManOptionHandler.prototype, "info", {
        get: function () { return this.options[this.active].aresti.info; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ManOptionHandler.prototype, "definition", {
        get: function () { return this.options[this.active].definition; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ManOptionHandler.prototype, "manoeuvre", {
        get: function () { return this.options[this.active].manoeuvre; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ManOptionHandler.prototype, "template", {
        get: function () { return this.options[this.active].template; },
        enumerable: false,
        configurable: true
    });
    return ManOptionHandler;
}());
exports.ManOptionHandler = ManOptionHandler;
