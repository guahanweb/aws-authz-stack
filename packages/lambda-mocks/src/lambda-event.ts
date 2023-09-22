import path from "path";
import fs from "fs";
import config from "./config";

class LambdaEvent {
    protected payload: any;

    load(basePath: string) {
        const json = fs.readFileSync(path.resolve(basePath, 'event.json')).toString();

        this.payload = JSON.parse(json);
    }
}

export class AuthorizerEvent extends LambdaEvent {
    constructor() {
        super();
        this.load(path.join(config.dataPath, "apigateway-authorizer"));
    }

    authorizationToken(value: string) {
        this.payload.authorizationToken = value;

        return this;
    }

    type(value: string) {
        this.payload.type = value;

        return this;
    }

    methodArn(value: string) {
        this.payload.methodArn = value;

        return this;
    }
}

export class ApiProxyEvent extends LambdaEvent {
    constructor() {
        super();
        this.load(path.join(config.dataPath, "apigateway-aws-proxy"));
    }

    method(value: string) {
        this.payload.httpMethod = value;
        this.payload.requestContext.httpMethod = value;

        return this;
    }

    path(value: string) {
        this.payload.path = value;
        this.payload.requestContext.path = value;

        return this;
    }

    body(value: any) {
        this.payload.body = JSON.stringify(value);

        return this;
    }

    headers(headerList: { [key:string]: string }[]) {
        headerList.forEach(({ key, value }) => {
            this.header(key, value);
        });

        return this;
    }

    header(key: string, value: string) {
        this.payload.headers[key] = value;

        return this;
    }
}