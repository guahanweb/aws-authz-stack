import { genRandomString } from "../../lib/password";
import * as queries from "./queries";

function cleanReturn(data: any) {
    data.access_token = data.pk;

    delete data.pk;
    delete data.sk;
    delete data.pData;
    delete data.sData;

    // seconds until expiration
    data.expires_in = data.ttl -Math.floor(Date.now() / 1000);

    return data;
}

export async function generateToken(dynamo: any, data: any, expires_in = 900) {
    queries.initialize(dynamo.table("authTokenSchema"));

    const ttl = Math.round((Date.now() / 1000) + expires_in);
    const access_token = genRandomString(32);

    // attach all the relevant info to tokens
    const { client_id, org, scopes, type } = data;
    const token = {
        access_token,
        client_id,
        org,
        scopes,
        type,
        ttl,
    };

    const params = queries.createToken(token);

    await dynamo.client.put(params);

    return cleanReturn(params.Item);
}

export async function getAccessToken(dynamo: any, tok: string) {
    queries.initialize(dynamo.table("authTokenSchema"));

    const params = queries.getAccessToken(tok);
    const response = await dynamo.client.get(params);
    const Item = response && response.Item;

    return Item ? cleanReturn(Item) : null;
}
