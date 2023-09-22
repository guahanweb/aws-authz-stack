"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestTime = void 0;
const months = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec',
];
function getRequestTime() {
    const now = new Date();
    const dd = (now.getDate() + '').padStart(2, '0');
    const month = months[now.getMonth()];
    const yyyy = now.getFullYear();
    const hh = (now.getHours() + '').padStart(2, '0');
    const mm = (now.getMinutes() + '').padStart(2, '0');
    const ss = (now.getSeconds() + '').padStart(2, '0');
    const epoch = now.getTime();
    const formatted = `${dd}/${month}/${yyyy}:${hh}:${mm}:${ss} +0000`;
    return {
        requestTime: formatted,
        requestTimeEpoch: epoch,
    };
}
exports.getRequestTime = getRequestTime;
