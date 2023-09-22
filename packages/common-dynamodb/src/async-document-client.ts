import type { DynamoDB } from 'aws-sdk'

export class AsyncDocumentClient {
    client: DynamoDB.DocumentClient;

    constructor(client: DynamoDB.DocumentClient) {
        this.client = client;
    }

    get(params: any) {
        return new Promise((resolve, reject) => {
            this.client.get(params, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    delete(params: any) {
        return new Promise((resolve, reject) => {
            this.client.delete(params, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    put(params: any) {
        return new Promise((resolve, reject) => {
            this.client.put(params, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    update(params: any) {
        return new Promise((resolve, reject) => {
            this.client.update(params, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    query(params: any) {
        return new Promise((resolve, reject) => {
            this.client.query(params, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    batchGet(params: any) {
        return new Promise((resolve, reject) => {
            this.client.batchGet(params, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }
}
