import { Request, Response } from 'express';
import { LambdaContext } from './lambda-context';
import { LambdaEvent } from './lambda-event';

export function expressToLambda(lambda: Function, opts?: any) {
    const handler = new LambdaWrapper(lambda, opts);

    return (req: Request, res: Response) => handler.process(req, res);
}

/**
 * Lambda Wrapper is intended to be a data transformation layer
 * between Express and lambda handler logic. All data payloads
 * are based on documentation here:
 * 
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
 * 
 */
class LambdaWrapper {
    private handler: Function;
    private event: LambdaEvent;
    private context: LambdaContext;

    constructor(handler: Function, opts?: any) {
        this.handler = handler;
        this.event = new LambdaEvent(opts);
        this.context = new LambdaContext(opts);
    }

    private sendResponse(res: Response, payload: any) {
        const { statusCode, body, headers } = payload;

        if (headers) {
            Object.keys(headers).forEach((key: string) => {
                // relay any headers to Express
                res.setHeader(key, headers[key]);
            })
        }

        let output = body || '';

        try {
            output = JSON.parse(body);
        } catch (err: any) {
            // no-op, since we will proxy the body string
        }

        return res.status(statusCode).send(output);
    }

    public process(req: Request, res: Response) {
        const event = this.event.parse(req);
        const context = this.context.parse(req);

       new Promise((resolve, reject) => {
            try {
                // this handles the callback lambdas
                const defer = this.handler(event, context, (err: any, result: any) => {
                    if (err) return reject(err);
                    resolve(result);
                });

                // if we returned a promise, be sure to us it
                if (defer && typeof defer.then === 'function') {
                    defer.then(resolve);
                }
            } catch (err: any) {
                reject(err);
            }
        }).then((result: any) => {
            // finally, when either has returned, send the response
            this.sendResponse(res, result);
        });
    }
}