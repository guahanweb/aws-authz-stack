import { Request } from 'express';

export class LambdaContext {
    private options?: any;

    constructor(opts?: any) {
        this.options = opts;
    }

    // for now, we are not looking at context
    public parse(req: Request) {
        return {};
    }
}