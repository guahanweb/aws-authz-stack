declare class LambdaEvent {
    protected payload: any;
    load(basePath: string): void;
}
export declare class AuthorizerEvent extends LambdaEvent {
    constructor();
    authorizationToken(value: string): this;
    type(value: string): this;
    methodArn(value: string): this;
}
export declare class ApiProxyEvent extends LambdaEvent {
    constructor();
    method(value: string): this;
    path(value: string): this;
    body(value: any): this;
    headers(headerList: {
        [key: string]: string;
    }[]): this;
    header(key: string, value: string): this;
}
export {};
//# sourceMappingURL=lambda-event.d.ts.map