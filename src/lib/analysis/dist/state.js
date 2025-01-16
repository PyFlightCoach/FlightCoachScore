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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.split_states = exports.state_multi = exports.state_centre = exports.state_range = exports.States = exports.State = void 0;
var geometry_1 = require("$lib/analysis/geometry");
var State = /** @class */ (function () {
    function State(data) {
        return Object.setPrototypeOf(data, State.prototype);
    }
    Object.defineProperty(State.prototype, "pos", {
        get: function () {
            return new geometry_1.Point(this.x, this.y, this.z);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(State.prototype, "att", {
        get: function () {
            return new geometry_1.Quaternion(this.rw, this.rx, this.ry, this.rz);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(State.prototype, "vel", {
        get: function () {
            return new geometry_1.Point(this.u, this.v, this.w);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(State.prototype, "rvel", {
        get: function () {
            return new geometry_1.Point(this.p, this.q, this.r);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(State.prototype, "acc", {
        get: function () {
            return new geometry_1.Point(this.du, this.dv, this.dw);
        },
        enumerable: false,
        configurable: true
    });
    State.prototype.body_to_world = function (p) {
        return this.att.transform_point(p).offset(this.pos);
    };
    State.prototype.direction = function () {
        return +(this.att.transform_point(new geometry_1.Point(1, 0, 0)).x > 0) * 2 - 1;
    };
    State.prototype.direction_str = function () {
        return this.direction() > 0 ? 'LTOR' : 'RTOL';
    };
    return State;
}());
exports.State = State;
var States = /** @class */ (function () {
    function States(data) {
        this.data = data;
    }
    States.parse = function (data) {
        return new States((data.hasOwnProperty('data') ? data.data : data).map(function (st) { return new State(st); }));
    };
    States.read_csv = function (data) {
        var cols;
        var sts = [];
        data.split('\n').forEach(function (line) {
            if (!cols) {
                cols = line.split(',');
            }
            else {
                sts.push(new State(Object.fromEntries(line.split(',').map(function (val, i) { return [cols[i], Number(val)]; }))));
            }
        });
        return new States(sts.slice(0, sts.length - 1));
    };
    States.prototype.getFCJIndexOffset = function (minalt) {
        if (minalt === void 0) { minalt = 10; }
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i].z > minalt) {
                return i;
            }
        }
    };
    States.prototype.getFCJLength = function (minalt) {
        if (minalt === void 0) { minalt = 10; }
        var fcjl = 0;
        this.data.forEach(function (st) {
            if (st.z > minalt) {
                fcjl += 1;
            }
        });
        return fcjl;
    };
    Object.defineProperty(States.prototype, "t", {
        get: function () {
            return this.data.map(function (state) { return state.t; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(States.prototype, "pos", {
        get: function () {
            return this.data.map(function (state) { return state.pos; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(States.prototype, "att", {
        get: function () {
            return this.data.map(function (state) { return state.att; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(States.prototype, "vel", {
        get: function () {
            return this.data.map(function (state) { return state.vel; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(States.prototype, "rvel", {
        get: function () {
            return this.data.map(function (state) { return state.rvel; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(States.prototype, "acc", {
        get: function () {
            return this.data.map(function (state) { return state.acc; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(States.prototype, "manoeuvre", {
        get: function () {
            return this.data.map(function (state) { return state.manoeuvre; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(States.prototype, "element", {
        get: function () {
            return this.data.map(function (state) { return state.element; });
        },
        enumerable: false,
        configurable: true
    });
    States.prototype.move = function (start) {
        var offset = geometry_1.Point.distance(this.pos[0], start);
        return new States(this.data.map(function (st, i) {
            return new State(__assign(__assign({}, st), { x: st.x + offset.x, y: st.y + offset.y, z: st.z + offset.z }));
        }));
    };
    States.prototype.body_to_world = function (p) {
        return this.data.map(function (st) { return st.body_to_world(p); });
    };
    States.from_xkf1 = function (box, orgn, xkf1) {
        var xorg = new geometry_1.GPS(orgn.Lat[0], orgn.Lng[0], orgn.Alt[0]);
        var box_rot = geometry_1.Quaternion.parse_euler(new geometry_1.Point(Math.PI, 0, (box.heading * Math.PI) / 180 + Math.PI / 2));
        var box_pos = new geometry_1.GPS(box.lat, box.lng, box.alt);
        var sts = [];
        var shift = new geometry_1.Point(box.move_east, -box.move_north, 0);
        for (var i = 0; i < xkf1.length; i++) {
            var posned = geometry_1.GPS.sub(xorg.offset(new geometry_1.Point(xkf1.PN[i], xkf1.PE[i], xkf1.PD[i])), box_pos);
            var att = geometry_1.Quaternion.parse_euler(new geometry_1.Point(xkf1.Roll[i], xkf1.Pitch[i], xkf1.Yaw[i]).mul(Math.PI / 180));
            var posbox = box_rot.transform_point(posned);
            var attbox = geometry_1.Quaternion.mul(box_rot, att);
            sts.push(new State({
                t: xkf1.time_boot_s[i],
                x: posbox.x + shift.x,
                y: posbox.y + shift.y,
                z: posbox.z + shift.z,
                rw: attbox.w,
                rx: attbox.x,
                ry: attbox.y,
                rz: attbox.z
            }));
        }
        return new States(sts);
    };
    States.from_fcj = function (fcj) {
        var box_rot = geometry_1.Quaternion.parse_euler(new geometry_1.Point(Math.PI, 0, fcj.origin.heading * Math.PI / 180 + Math.PI / 2));
        var shift = new geometry_1.Point(fcj.parameters.moveEast, -fcj.parameters.moveNorth, 0);
        var lastT = fcj.data[0].time / 1e6 - 1 / 25;
        return new States(fcj.data.map(function (row) {
            var posbox = box_rot.transform_point(new geometry_1.Point(row.N, row.E, row.D));
            var attbox = geometry_1.Quaternion.mul(box_rot, geometry_1.Quaternion.parse_euler(new geometry_1.Point(row.roll, row.pitch, row.yaw)));
            var velbody = attbox
                .inverse()
                .transform_point(box_rot.transform_point(new geometry_1.Point(row.VN, row.VE, row.VD)));
            var st = new State({
                t: row.time / 1e6,
                dt: row.time / 1e6 - lastT,
                x: posbox.x + shift.x,
                y: posbox.y + shift.y,
                z: posbox.z + shift.z,
                rw: attbox.w,
                rx: attbox.x,
                ry: attbox.y,
                rz: attbox.z,
                u: velbody.x,
                v: velbody.y,
                w: velbody.z
            });
            lastT = row.time / 1e6;
            return st;
        }));
    };
    States.prototype.slice = function (start, stop) {
        return new States(this.data.slice(start, stop));
    };
    States.prototype.range = function (col) {
        return (Math.max.apply(0, this.data.map(function (st) { return st[col]; })) -
            Math.min.apply(0, this.data.map(function (st) { return st[col]; })));
    };
    States.prototype.plotRange = function (col, zero, pad) {
        if (zero === void 0) { zero = false; }
        if (pad === void 0) { pad = 0; }
        var cmin = Math.min.apply(Math, this.data.map(function (st) { return st[col]; })) - pad;
        var cmax = Math.max.apply(Math, this.data.map(function (st) { return st[col]; })) + pad;
        if (zero) {
            return [Math.min(0 - pad, cmin), Math.max(0 + pad, cmax)];
        }
        else {
            return [cmin, cmax];
        }
    };
    States.prototype.split = function () {
        var states = {};
        var last_el = '';
        this.data.forEach(function (st) {
            if (st.element in states) {
                states[st.element].data.push(st);
            }
            else {
                if (last_el != '') {
                    states[last_el].data.push(st);
                }
                last_el = st.element;
                states[st.element] = new States([st]);
            }
        });
        return states;
    };
    States.prototype.downsample = function (n) {
        //reduce a list of states to n equally spaced ones, include the first and last ones
        var spacing = Math.floor(this.data.length / (n - 1));
        var sts = [];
        for (var i = 0; i <= n - 2; i++) {
            sts.push(this.data[i * spacing]);
        }
        if (n >= 1) {
            sts.push(this.data[this.data.length - 1]);
        }
        return new States(sts);
    };
    States.prototype.elements = function () {
        return __spreadArrays(new Set(this.element));
    };
    States.prototype.end_info = function () {
        var _this = this;
        var all_elements = this.element;
        return Object.fromEntries(this.elements().map(function (el) {
            var lastid = all_elements.lastIndexOf(el);
            var firstid = all_elements.indexOf(el);
            return [
                el,
                {
                    lastid: lastid,
                    lastt: _this.data[lastid].t,
                    firstid: firstid,
                    firstt: _this.data[firstid].t
                }
            ];
        }));
    };
    return States;
}());
exports.States = States;
function state_range(state, col, extend) {
    if (extend === void 0) { extend = 0; }
    return [
        Math.min.apply(0, state.map(function (st) { return st[col]; })),
        Math.max.apply(0, state.map(function (st) { return st[col]; }))
    ];
}
exports.state_range = state_range;
function state_centre(state, col) {
    var srange = state_range(state, col);
    return (srange[0] + srange[1]) / 2;
}
exports.state_centre = state_centre;
function state_multi(state, cols, func) {
    var ranges = {};
    cols.forEach(function (col) {
        ranges[col] = func(state, col);
    });
    return ranges;
}
exports.state_multi = state_multi;
function split_states(state, col) {
    var states = {};
    state.forEach(function (st) {
        if (st[col] in states) {
            states[st[col]].push(st);
        }
        else {
            states[st[col]] = [st];
        }
    });
    return states;
}
exports.split_states = split_states;
