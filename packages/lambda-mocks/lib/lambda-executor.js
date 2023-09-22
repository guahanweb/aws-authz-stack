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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaExecutor = exports.lambda = void 0;
const lambda_event_1 = require("./lambda-event");
function lambda() {
    return new LambdaExecutor();
}
exports.lambda = lambda;
class LambdaExecutor {
    constructor() {
        this.event = null;
        this.context = null;
    }
    proxy(configure) {
        if (this.event !== null)
            throw new Error("lambda event already initialized, cannot call proxy()");
        const event = new lambda_event_1.ApiProxyEvent();
        if (configure !== undefined) {
            configure(event, {});
        }
        this.event = event;
        return this;
    }
    authorizer(configure) {
        if (this.event !== null)
            throw new Error("lambda event already initialized, cannot call authorizer()");
        const event = new lambda_event_1.AuthorizerEvent();
        if (configure !== undefined) {
            configure(event, {});
        }
        this.event = event;
        return this;
    }
    invoke(handler) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield handler(this.event.payload, this.context);
            return response;
        });
    }
}
exports.LambdaExecutor = LambdaExecutor;
