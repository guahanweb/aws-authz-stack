import { createItem, getItemByPK, getInsertDate } from "../utils";

const SK = "TOKEN";

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

export function createToken(data: any) {
    assertInitialized();

    const { access_token, org } = data;
    const created = getInsertDate();

    data.pk = access_token;
    data.sk = SK;
    data.pData = `${org}#${created}`;
    data.created = created;

    const params: any = createItem(data, TableName);

    params.Item = data;

    return params;
}

export function getAccessToken(token: string) {
    assertInitialized();

    return getItemByPK(token, SK, TableName);
}
