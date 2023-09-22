import * as pw from "../../lib/password";
import * as queries from "./queries";
import * as tokens from "../tokens";

function cleanReturn(data: any, removeAuth = false) {
    data.access_key = data.pk;

    delete data.pk;
    delete data.sk;
    delete data.pData;
    delete data.sData;

    if (removeAuth) {
        delete data.salt;
        delete data.passwordHash;
    }

    return data;
}

export async function generateKeyPair(dynamo: any, options: any) {
    queries.initialize(dynamo.table("apiKeySchema"));

    // key pair
    const access_key = pw.genRandomString(20).toUpperCase();
    const access_secret = pw.genSecretKey(40);

    // additional information (will be attached to tokens)
    const client_id = (options && options.client) || null;
    const org = (options && options.organization) || null;

    let scopes = (options && options.scopes) || "";

    if (scopes instanceof Array) {
        scopes = scopes.join(",");
    }

    try {
        if (!client_id || !org) {
            throw new Error("access key pair requires client_id and org");
        }

        const { passwordHash, salt } = pw.saltHashPassword(access_secret);
        const data = {
            org,
            client_id,
            scopes,
            access_key,
            passwordHash,
            salt,
        };
        const params = queries.createKeyPair(data);

        await dynamo.client.put(params);

        return cleanReturn({
            ...params.Item,
            access_secret,
        }, true);
    } catch (err: any) {
        throw err;
    }
}

export async function getKeyPair(dynamo: any, access_key: string) {
    queries.initialize(dynamo.table("apiKeySchema"));

    try {
        const params = queries.getApiKey(access_key);
        const result = await dynamo.client.get(params);

        return cleanReturn(result.Item);
    } catch (err: any) {
        console.error(err);

        throw err;
    }
}

export async function createAccessToken(dynamo: any, access_key: string, access_secret: string) {
    queries.initialize(dynamo.table("apiKeySchema"));

    const key = await getKeyPair(dynamo, access_key);
    const { passwordHash, salt } = key;

    if (!pw.validate(access_secret, passwordHash, salt)) {
        throw new Error("invalid credentials provided");
    }

    const tok = await tokens.generateToken(dynamo, {
        client_id: key.client_id,
        org: key.og,
        scopes: key.scopes,
        type: "BEARER",
    });

    return tok;
}