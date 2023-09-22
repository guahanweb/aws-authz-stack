import { Request } from 'express';
export declare class LambdaEvent {
    private options;
    constructor(opts?: any);
    private getUrl;
    private headers;
    private context;
    parse(req: Request): {
        body: string;
        resource: any;
        path: string;
        httpMethod: string;
        isBase64Encoded: boolean;
        queryStringParameters: import("qs").ParsedQs;
        multiValueQueryStringParameters: {};
        pathParameters: import("express-serve-static-core").ParamsDictionary;
        stageVariables: {};
        headers: any;
        multiValueHeaders: any;
        requestContext: any;
    };
}
//# sourceMappingURL=lambda-event.d.ts.map