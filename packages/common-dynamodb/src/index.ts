import AWS from 'aws-sdk'
import { AsyncDocumentClient } from './async-document-client'

interface DynamoOptions {
    apiVersion?: string;
    endpoint?: string;
    prefix?: string;
    region?: string;
}

const defaultOptions: DynamoOptions = {
    apiVersion: '2012-08-10',
    endpoint: 'http://localhost:8000/',
    prefix: 'local',
    region: 'us-east-1',
};

export class DynamoClient {
    dynamodb;
    client;
    config;

    tables = {};
    dbSchema = {};

    constructor(opts: DynamoOptions) {
        const config = {
            ...defaultOptions,
            ...opts,
        };

        this.dynamodb = new AWS.DynamoDB({
            apiVersion: config.apiVersion,
            endpoint: config.endpoint,
            region: config.region,
        });

        const docClient = new AWS.DynamoDB.DocumentClient({
            service: this.dynamodb,
            convertEmptyValues: true,
        });

        this.config = config;
        this.client = new AsyncDocumentClient(docClient);
    }

    table(name: string) {
        return `${this.config.prefix}-${name}`;
    }

    loadSchema(schema: any) {
        // reset schema
        this.tables = {};
        this.dbSchema = {};

        Object.keys(schema).forEach((key: string) => {
            const tableName = this.table(key);

            this.tables[key] = tableName;
            this.dbSchema[tableName] = schema[key];
        });
    }

    async getExactly(params, limit = 50, lastIndex = null, results = null, keys = ['pk', 'sk', 'pData']) {
        // set up for pagination
        params.Limit = limit;
        if (lastIndex) {
            params.ExclusiveStartKey = lastIndex;
        }

        const current = await this.client.query(params);

        if (results && results.Items.length) {
            // prepend any provided results to this query
            current.Items = [
                ...results.Items,
                ...current.Items,
            ];
        }

        const { Items, LastEvaluatedKey } = current;

        if (!LastEvaluatedKey || Items.length === limit) {
            // nothing more to do
            return current;
        } else if (Items.length > limit) {
            // trim off the extra
            const TrimmedItems = Items.slice(0, limit);
            const last = TrimmedItems[limit - 1];
            const NewIndex = keys.reduce((prev, curr) => {
                prev[curr] = last[curr];

                return prev;
            }, {});

            return {
                ...current,
                Items: TrimmedItems,
                LastEvaluatedKey: NewIndex,
            };
        } else {
            // chain the calls until we get enough records
            return await this.getExactly(params, limit, LastEvaluatedKey, current);
        }
    }

    tableExists(table: string) {
        const params = { TableName: this.table(table) };

        return new Promise((resolve, reject) => {
            this.dynamodb.describeTable(params, (err, data) => {
                if (err || Object.keys(data).length < 1) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    createTable(tableName: string): Promise<any> {
        let table = this.tables && this.tables[tableName];
        let schema = this.dbSchema && this.dbSchema[table];
        let TTL = null;

        // set up TTL if provided
        if (schema && schema.TimeToLiveSpecification) {
            TTL = { ...schema.TimeToLiveSpecification };
            delete schema.TimeToLiveSpecification;
        }

        return new Promise((resolve, reject) => {
            if (!schema) {
                return reject(new Error(`unknown table: ${tableName}`));
            }

            schema.TableName = this.table(tableName);
            this.tableExists(tableName).then(exists => {
                if (exists) {
                    // table already exists, so skip
                    return resolve(true);
                } else {
                    this.dynamodb.createTable(schema, (err, data) => {
                        if (err) return reject(err);
                        // table is created: now check TTL
                        if (TTL) {
                            const params = {
                                TableName: schema.TableName,
                                TimeToLiveSpecification: TTL,
                            };

                            this.dynamodb.updateTimeToLive(params, err => {
                                if (err) return reject(err);
                                resolve(data);
                            });
                        } else {
                            resolve(data);
                        }
                    });
                }
            })
        });
    }

    deleteTable(tableName: string): Promise<any> {
        let table = this.tables && this.tables[tableName];
        let schema = this.dbSchema && this.dbSchema[table];

        return new Promise((resolve, reject) => {
            if (!schema) return reject(new Error(`unknown table: ${tableName}`));

            this.dynamodb.deleteTable({ TableName: tableName }, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        })
    }
}