interface DynamoOptions {
    apiVersion?: string;
    endpoint?: string;
    prefix?: string;
    region?: string;
}
export declare class DynamoClient {
    dynamodb: any;
    client: any;
    config: any;
    tables: {};
    dbSchema: {};
    constructor(opts: DynamoOptions);
    table(name: string): string;
    loadSchema(schema: any): void;
    getExactly(params: any, limit?: number, lastIndex?: any, results?: any, keys?: string[]): any;
    tableExists(table: string): Promise<unknown>;
    createTable(tableName: string): Promise<any>;
    deleteTable(tableName: string): Promise<any>;
}
export {};
