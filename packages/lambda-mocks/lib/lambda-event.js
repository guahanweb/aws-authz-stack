"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiProxyEvent = exports.AuthorizerEvent = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("./config"));
class LambdaEvent {
    load(basePath) {
        const json = fs_1.default.readFileSync(path_1.default.resolve(basePath, 'event.json')).toString();
        this.payload = JSON.parse(json);
    }
}
class AuthorizerEvent extends LambdaEvent {
    constructor() {
        super();
        this.load(path_1.default.join(config_1.default.dataPath, "apigateway-authorizer"));
    }
    authorizationToken(value) {
        this.payload.authorizationToken = value;
        return this;
    }
    type(value) {
        this.payload.type = value;
        return this;
    }
    methodArn(value) {
        this.payload.methodArn = value;
        return this;
    }
}
exports.AuthorizerEvent = AuthorizerEvent;
class ApiProxyEvent extends LambdaEvent {
    constructor() {
        super();
        this.load(path_1.default.join(config_1.default.dataPath, "apigateway-aws-proxy"));
    }
    method(value) {
        this.payload.httpMethod = value;
        this.payload.requestContext.httpMethod = value;
        return this;
    }
    path(value) {
        this.payload.path = value;
        this.payload.requestContext.path = value;
        return this;
    }
    body(value) {
        this.payload.body = JSON.stringify(value);
        return this;
    }
    headers(headerList) {
        headerList.forEach(({ key, value }) => {
            this.header(key, value);
        });
        return this;
    }
    header(key, value) {
        this.payload.headers[key] = value;
        return this;
    }
}
exports.ApiProxyEvent = ApiProxyEvent;
