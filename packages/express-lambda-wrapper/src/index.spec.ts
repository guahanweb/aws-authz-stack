import { expressToLambda } from './index';
import { default as express } from 'express';
import request from 'supertest';

function buildResponse(body: object|string, statusCode: number = 200) {
    return {
        isBase64Encoded: true,
        body: (typeof body === 'string') ? body : JSON.stringify(body),
        statusCode,
    };
}

function successLambda(event: any, context: any, callback: Function) {
    callback(null, buildResponse('ok', 200));
}

async function asyncSuccessLambda(event: any, context: any) {
    return buildResponse('ok', 200);
}

describe ('expressToLambda() wrapper', () => {
    it ('should fully wrap callback lambdas', async () => {
        const app = express();

        app.get('/healthcheck', expressToLambda(successLambda));

        const response = await request(app).get('/healthcheck');

        expect(response.status).toEqual(200);
        expect(response.text).toEqual('ok');
    });

    it ('should fully wrap async lambdas', async () => {
        const app = express();

        app.get('/healthcheck', expressToLambda(asyncSuccessLambda));

        const response = await request(app).get('/healthcheck');

        expect(response.status).toEqual(200);
        expect(response.text).toEqual('ok');
    });
});