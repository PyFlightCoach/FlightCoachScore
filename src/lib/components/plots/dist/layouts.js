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
exports.get_ar = exports.create3DLayout = exports.layout3d = void 0;
var arrays_1 = require("$lib/utils/arrays");
exports.layout3d = {
    legend: { font: { size: 20 }, yanchor: "top", y: 0.99, xanchor: "left", x: 0.01 },
    //autosize: true,
    margin: { l: 0, r: 0, t: 0, b: 0 },
    scene: {
        aspectmode: 'data',
        camera: {
            up: { x: 0, y: 0, z: 1 },
            center: { x: 0, y: 0, z: 0 },
            eye: { x: 0, y: -2, z: -1 },
            projection: { type: 'perspective' }
        },
        xaxis: {},
        yaxis: {},
        zaxis: {},
        aspectratio: {}
    }
};
exports.create3DLayout = function (sts, includeZero, expand, hideAxes) {
    if (includeZero === void 0) { includeZero = false; }
    if (expand === void 0) { expand = 0; }
    if (hideAxes === void 0) { hideAxes = false; }
    var newlayout = structuredClone(exports.layout3d);
    var ranges = {
        x: sts.plotRange('x', includeZero, expand),
        y: sts.plotRange('y', includeZero, expand),
        z: sts.plotRange('z', includeZero, expand)
    };
    newlayout.scene.xaxis = { range: ranges.x, visible: !hideAxes };
    newlayout.scene.yaxis = { range: ranges.y, visible: !hideAxes };
    newlayout.scene.zaxis = { range: ranges.z, visible: !hideAxes };
    newlayout.scene.aspectmode = 'manual';
    var max_range = Math.max(ranges.x[1] - ranges.x[0], ranges.y[1] - ranges.y[0], ranges.z[1] - ranges.z[0]);
    //
    newlayout.scene.aspectratio = {
        x: (ranges.x[1] - ranges.x[0]) / max_range,
        y: (ranges.y[1] - ranges.y[0]) / max_range,
        z: (ranges.z[1] - ranges.z[0]) / max_range
    };
    return newlayout;
};
exports.get_ar = function (data, offset) {
    if (offset === void 0) { offset = 20; }
    var axes = {};
    var ranges = {};
    ['x', 'y', 'z'].forEach(function (d) {
        var maxlim = data[0][d][0];
        var minlim = data[0][d][0];
        Object.values(data).forEach(function (v) {
            maxlim = arrays_1.max(__spreadArrays([maxlim], v[d]));
            minlim = arrays_1.min(__spreadArrays([minlim], v[d]));
        });
        if ((maxlim != null) && (minlim != null)) {
            maxlim = maxlim + offset;
            minlim = minlim - offset;
            var range = maxlim - minlim;
            axes[d + 'axis'] = { range: [minlim, maxlim] };
            ranges[d] = range;
        }
    });
    var maxrange = Math.max.apply(0, Object.values(ranges));
    ['x', 'y', 'z'].forEach(function (d) {
        ranges[d + 'axis'] = ranges[d] / maxrange;
    });
    return __assign(__assign({}, exports.layout3d), { scene: __assign(__assign(__assign({}, exports.layout3d.scene), axes), { aspectratio: ranges, aspectmode: 'manual' }) });
};
