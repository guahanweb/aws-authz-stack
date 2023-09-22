import config from "../src/config";
import schema from "../src/schema/tables";
import { DynamoClient } from "@careacademy/common-dynamodb";
import * as keys from "../src/models/api_keys";

main();

async function main() {
    const dynamo = await connect();

    const result = await keys.generateKeyPair(dynamo, {
        organization: "Demo Organization",
        client: "DEMO.LOCALSTACK.TEST",
        scopes: ["admin:read", "admin:write"],
    });

    console.log(result);
}

function connect() {
    const dynamo = new DynamoClient({
        apiVersion: config.dynamo.version,
        endpoint: config.dynamo.endpoint,
        region: config.dynamo.region,
        prefix: config.dynamo.tablePrefix,
    });

    dynamo.loadSchema(schema);

    return dynamo;
}