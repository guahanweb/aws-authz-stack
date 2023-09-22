import {
    getInsertDate,
    createItem,
    getItemByPK,
    deleteItemByPK,
    getListBySK,
    buildUpdateExpression,
} from "../utils";

const SK = "API_KEY";

let TableName: string;
let initialized = false;

function assertInitialized() {
    if (!initialized) {
        throw new Error("cannot operate on the model without first initializing");
    }
}

export function initialize(tableName: string) {
    TableName = tableName;
    initialized = true;
}

export function createKeyPair(data: any) {
    assertInitialized();

    const created = getInsertDate();
    const { org, access_key } = data;

    data.pk = access_key;
    data.sk = SK;
    data.pData = `${org}#${created}`;
    data.created = created;

    const params = createItem(data, TableName);

    params.Item = data;

    return params;
}

export function getApiKey(access_key: string) {
    assertInitialized();

    return getItemByPK(access_key, SK, TableName);
}

export function updateApiKey(access_key: string, data: any) {
    assertInitialized();

    return {
        ...getApiKey(access_key),
        ...buildUpdateExpression(data),
    };
}

export function deleteApiKey(access_key: string) {
    assertInitialized();

    return deleteItemByPK(access_key, SK, TableName);
}

export function getApiKeyByOrganization(org: string, limit = 100) {}