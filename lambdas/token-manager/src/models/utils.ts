export function createItem(data: any, tableName: string) {
    return {
        TableName: tableName,
        Item: data,
    }
}

export function getItemByPK(pk: string, sk: string, tableName: string) {
    return {
        TableName: tableName,
        Key: { pk, sk },
    }
}

export function deleteItemByPK(pk: string, sk: string, tableName: string) {
    return getItemByPK(pk, sk, tableName);
}

export function getListByPK(pk: string, sk: string, limit: number, reverse: boolean, tableName: string) {
    let params: any = {
        TableName: tableName,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
            ":pk": pk
        },
        ScanIndexForward: !reverse,
        Limit: limit || 100
    };

    if (!!sk) {
        params.KeyConditionExpression += " and begins_with(sk, :sk)";
        params.ExpressionAttributeValues[":sk"] = sk;
    }

    return params;
}

export function getListBySK(sk: string, pData: string, limit: number, reverse: boolean, tableName: string) {
    let params: any = {
        TableName: tableName,
        IndexName: "sk-pData",
        KeyConditionExpression: "sk = :sk",
        ExpressionAttributeValues: {
            ":sk": sk,
        },
        ScanIndexForward: !reverse,
        Limit: limit,
    };

    if (!!pData) {
        params.KeyConditionExpression += " and begins_with(pData, :pData)";
        params.ExpressionAttributeValues[":pData"] = pData;
    }

    return params;
}

export function buildUpdateExpression(data: any, ReturnValues = "ALL_NEW") {
    let params: any = {
        UpdateExpression: "",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
        ReturnValues,
    };

    let keys = "abcdefghijklmnopqrstuvwxyz",
        i = 0,
        updates: string[] = [],
        k, name, val;

    Object.keys(data).forEach(key => {
        k = keys[i++];
        name = `#${k}`;
        val  = `:${k}`;
        params.ExpressionAttributeNames[name] = key;
        params.ExpressionAttributeValues[val] = data[key];
        updates.push(`${name} = ${val}`);
    });

    params.UpdateExpression = "set " + updates.join(", ");

    return params;
}

export function getInsertDate() {
    return (new Date).toISOString();
}
