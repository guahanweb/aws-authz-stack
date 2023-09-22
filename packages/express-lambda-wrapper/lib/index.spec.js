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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
function buildResponse(body, statusCode = 200) {
    return {
        isBase64Encoded: true,
        body: (typeof body === 'string') ? body : JSON.stringify(body),
        statusCode,
    };
}
function successLambda(event, context, callback) {
    callback(null, buildResponse('ok', 200));
}
function asyncSuccessLambda(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        return buildResponse('ok', 200);
    });
}
describe('expressToLambda() wrapper', () => {
    it('should fully wrap callback lambdas', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        app.get('/healthcheck', (0, index_1.expressToLambda)(successLambda));
        const response = yield (0, supertest_1.default)(app).get('/healthcheck');
        expect(response.status).toEqual(200);
        expect(response.text).toEqual('ok');
    }));
    it('should fully wrap async lambdas', () => __awaiter(void 0, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        app.get('/healthcheck', (0, index_1.expressToLambda)(asyncSuccessLambda));
        const response = yield (0, supertest_1.default)(app).get('/healthcheck');
        expect(response.status).toEqual(200);
        expect(response.text).toEqual('ok');
    }));
});
