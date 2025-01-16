"use strict";
exports.__esModule = true;
exports.nth = void 0;
function nth(n) {
    //https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
    return "" + n + (['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || 'th');
}
exports.nth = nth;
