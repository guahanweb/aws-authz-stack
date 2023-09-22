export declare function lambda(): LambdaExecutor;
export declare class LambdaExecutor {
    context: any | null;
    event: any | null;
    constructor();
    proxy(configure?: Function): this;
    authorizer(configure?: Function): this;
    invoke(handler: Function): Promise<any>;
}
//# sourceMappingURL=lambda-executor.d.ts.map