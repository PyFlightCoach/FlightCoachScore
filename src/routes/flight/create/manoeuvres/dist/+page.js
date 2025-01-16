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
exports.load = void 0;
var analysis_1 = require("$lib/stores/analysis");
var store_1 = require("svelte/store");
var navigation_1 = require("$app/navigation");
var paths_1 = require("$app/paths");
var state_1 = require("$lib/analysis/state");
var shared_1 = require("$lib/stores/shared");
function load(_a) {
    var fetch = _a.fetch;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(store_1.get(analysis_1.binData) && store_1.get(analysis_1.origin))) return [3 /*break*/, 1];
                    analysis_1.states.set(state_1.States.from_xkf1(store_1.get(analysis_1.origin), store_1.get(analysis_1.binData).orgn, store_1.get(analysis_1.binData).xkf1));
                    return [3 /*break*/, 4];
                case 1:
                    if (!!store_1.get(analysis_1.states)) return [3 /*break*/, 4];
                    if (!(store_1.get(shared_1.dev) && confirm("no data loaded, load test data ?"))) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetch('/st.csv').then(function (r) { return r.text(); }).then(function (text) { return analysis_1.states.set(state_1.States.read_csv(text)); })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    navigation_1.goto(paths_1.base + '/flight/create/data');
                    _b.label = 4;
                case 4:
                    if (!store_1.get(analysis_1.fcj)) return [3 /*break*/, 6];
                    return [4 /*yield*/, analysis_1.updateSplits(store_1.get(analysis_1.fcj))];
                case 5:
                    (_b.sent());
                    _b.label = 6;
                case 6: return [2 /*return*/, { baseSplits: store_1.get(analysis_1.manSplits) }];
            }
        });
    });
}
exports.load = load;
