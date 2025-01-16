"use strict";
exports.__esModule = true;
exports.scheduleRepr = exports.DBFlightHandler = exports.dbFlightPrivacy = exports.stackFlights = exports.DBFlightStack = exports.privacyOptions = void 0;
var geometry_1 = require("$lib/analysis/geometry");
exports.privacyOptions = ['basic', 'view_flown', 'view_analysis'];
var DBFlightStack = /** @class */ (function () {
    function DBFlightStack(loc) {
        this.loc = loc;
        this.flights = [];
    }
    DBFlightStack.build = function (flight) {
        var dbf = new DBFlightStack(new geometry_1.GPS(flight.origin_lat, flight.origin_lng, 0));
        dbf.add(flight);
        return dbf;
    };
    DBFlightStack.prototype.checkAddFlight = function (flight, tolerance) {
        if (geometry_1.GPS.sub(new geometry_1.GPS(flight.origin_lat, flight.origin_lng, 0), this.loc).length() < tolerance) {
            this.add(flight);
            return true;
        }
        else {
            return false;
        }
    };
    DBFlightStack.prototype.add = function (flight) {
        this.flights.push(flight);
    };
    Object.defineProperty(DBFlightStack.prototype, "info", {
        get: function () {
            var best_pilot = this.bestFlight.name;
            return Object.entries({
                maxScore: this.maxScore,
                nFlights: this.nFlights,
                nPilots: this.pilots.length,
                pilots: '<br>' + this.pilots.map(function (v) { return v == best_pilot ? v + "*" : v; }).join(',<br>')
            }).map(function (_a) {
                var k = _a[0], v = _a[1];
                return k + ": " + v;
            }).join('<br>');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DBFlightStack.prototype, "origin_lat", {
        get: function () {
            return this.loc.lat;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DBFlightStack.prototype, "origin_lng", {
        get: function () {
            return this.loc.lon;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DBFlightStack.prototype, "minScore", {
        get: function () {
            return Math.min.apply(Math, this.flights.map(function (f) { return f.score; }));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DBFlightStack.prototype, "maxScore", {
        get: function () {
            return Math.max.apply(Math, this.flights.map(function (f) { return f.score; }));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DBFlightStack.prototype, "bestFlight", {
        get: function () {
            return this.flights.reduce(function (a, b) { return (a.score > b.score ? a : b); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DBFlightStack.prototype, "worstFlight", {
        get: function () {
            return this.flights.reduce(function (a, b) { return (a.score < b.score ? a : b); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DBFlightStack.prototype, "avgScore", {
        get: function () {
            return this.flights.reduce(function (a, b) { return a.score + b.score; }, 0) / this.flights.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DBFlightStack.prototype, "nFlights", {
        get: function () {
            return this.flights.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DBFlightStack.prototype, "pilots", {
        get: function () {
            return Array.from(new Set(this.flights.map(function (f) { return f.name; })));
        },
        enumerable: false,
        configurable: true
    });
    return DBFlightStack;
}());
exports.DBFlightStack = DBFlightStack;
function stackFlights(trs, tolerance) {
    var stacks = [];
    trs.forEach(function (tr) {
        var added = false;
        for (var _i = 0, stacks_1 = stacks; _i < stacks_1.length; _i++) {
            var st = stacks_1[_i];
            if (st.checkAddFlight(tr, tolerance)) {
                added = true;
                break;
            }
        }
        if (!added) {
            stacks.push(DBFlightStack.build(tr));
        }
    });
    return stacks;
}
exports.stackFlights = stackFlights;
exports.dbFlightPrivacy = {
    basic: 'basic',
    view: 'view_flown',
    analysis: 'view_analysis'
};
var DBFlightHandler = /** @class */ (function () {
    function DBFlightHandler(ranked, meta) {
        if (meta === void 0) { meta = undefined; }
        this.ranked = ranked;
        this.meta = meta;
    }
    return DBFlightHandler;
}());
exports.DBFlightHandler = DBFlightHandler;
function scheduleRepr(s) {
    return s ? (s.category_name + " " + s.schedule_name).toUpperCase() : '';
}
exports.scheduleRepr = scheduleRepr;
