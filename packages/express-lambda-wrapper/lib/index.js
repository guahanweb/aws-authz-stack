"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressToLambda = void 0;
const lambda_context_1 = require("./lambda-context");
const lambda_event_1 = require("./lambda-event");
function expressToLambda(lambda, opts) {
    const handler = new LambdaWrapper(lambda, opts);
    return (req, res) => handler.process(req, res);
}
exports.expressToLambda = expressToLambda;
/**
 * Lambda Wrapper is intended to be a data transformation layer
 * between Express and lambda handler logic. All data payloads
 * are based on documentation here:
 *
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
 *
 */
class LambdaWrapper {
    constructor(handler, opts) {
        this.handler = handler;
        this.event = new lambda_event_1.LambdaEvent(opts);
        this.context = new lambda_context_1.LambdaContext(opts);
    }
    sendResponse(res, payload) {
        const { statusCode, body, headers } = payload;
        if (headers) {
            Object.keys(headers).forEach((key) => {
                // relay any headers to Express
                res.setHeader(key, headers[key]);
            });
        }
        let output = body || '';
        try {
            output = JSON.parse(body);
        }
        catch (err) {
            // no-op, since we will proxy the body string
        }
        return res.status(statusCode).send(output);
    }
    process(req, res) {
        const event = this.event.parse(req);
        const context = this.context.parse(req);
        new Promise((resolve, reject) => {
            try {
                // this handles the callback lambdas
                const defer = this.handler(event, context, (err, result) => {
                    if (err)
                        return reject(err);
                    resolve(result);
                });
                // if we returned a promise, be sure to us it
                if (defer && typeof defer.then === 'function') {
                    defer.then(resolve);
                }
            }
            catch (err) {
                reject(err);
            }
        }).then((result) => {
            // finally, when either has returned, send the response
            this.sendResponse(res, result);
        });
    }
}
