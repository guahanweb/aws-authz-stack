import type { DynamoDB } from 'aws-sdk';
export declare class AsyncDocumentClient {
    client: DynamoDB.DocumentClient;
    constructor(client: DynamoDB.DocumentClient);
    get(params: any): Promise<unknown>;
    delete(params: any): Promise<unknown>;
    put(params: any): Promise<unknown>;
    update(params: any): Promise<unknown>;
    query(params: any): Promise<unknown>;
    batchGet(params: any): Promise<unknown>;
}
