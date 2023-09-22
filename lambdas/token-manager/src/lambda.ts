import config from "./config";
import schema from "./schema/tables";
import { DynamoClient } from "@careacademy/common-dynamodb";
import * as pw from "./lib/password";
import * as keys from "./models/api_keys";
import * as tokens from "./models/tokens";

function ok(data: any) {
    return {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify(data),
    };
}

function unauthorized() {
    return {
        isBase64Encoded: false,
        statusCode: 401,
        body: JSON.stringify({
            error: "Unauthorized",
        })
    };
}

function connect() {
    console.log("CONFIG:", JSON.stringify(config.dynamo));

    const dynamo = new DynamoClient({
        apiVersion: config.dynamo.version,
        endpoint: config.dynamo.endpoint,
        region: config.dynamo.region,
        prefix: config.dynamo.tablePrefix,
    });

    dynamo.loadSchema(schema);

    return dynamo;
}

function parseAuthHeader({ headers }: any, use_basic = false) {
    let token: null|string = null;

    for (let h in headers) {
        if (headers.hasOwnProperty(h) && h.toLowerCase() === "authorization") {
            const r = use_basic ? /^Basic\s+/i : /^Bearer\s+/i;

            token = headers[h].replace(r, "");
        }
    }

    return token;
}

function parseQueryString({ queryStringParameters }: any, param: string) {
    const value = queryStringParameters && queryStringParameters[param];

    return value || null;
}

export async function validateToken(event: any) {
    try {
        console.log(JSON.stringify(event));
        const dynamo = connect();
        const data = parseQueryString(event, "token");
        const token = await tokens.getAccessToken(dynamo, data);

        return token
            ? ok({ token })
            : unauthorized();
    } catch (err: any) {
        console.error("[ERR:generated]", err.message);

        return unauthorized();
    }
}

export async function generateToken(event: any) {
    try {
        const dynamo = connect();
        const authorization = parseAuthHeader(event, true);

        if (authorization === null) throw new Error("no authorization provided");

        const credentials = pw.decodeBasicAuth(authorization);

        const token = await keys.createAccessToken(dynamo, credentials.user, credentials.pass); // createAccessToken(credentials.user, credentials.pass);

        return ok({token});
    } catch (err: any) {
        console.error(`[ERROR:generate] ${err.message}`);

        return unauthorized();
    }
}
