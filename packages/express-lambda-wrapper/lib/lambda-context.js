"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaContext = void 0;
class LambdaContext {
    constructor(opts) {
        this.options = opts;
    }
    // for now, we are not looking at context
    parse(req) {
        return {};
    }
}
exports.LambdaContext = LambdaContext;
