import { AuthorizerEvent, ApiProxyEvent } from "./lambda-event";

export function lambda() {
    return new LambdaExecutor();
}

export class LambdaExecutor {
    public context: any|null;
    public event: any|null;

    constructor() {
        this.event = null;
        this.context = null;
    }

    proxy(configure?: Function) {
        if (this.event !== null) throw new Error("lambda event already initialized, cannot call proxy()");

        const event = new ApiProxyEvent();

        if (configure !== undefined) {
            configure(event, {});
        }

        this.event = event;

        return this;
    }

    authorizer(configure?: Function) {
        if (this.event !== null) throw new Error("lambda event already initialized, cannot call authorizer()");

        const event = new AuthorizerEvent();

        if (configure !== undefined) {
            configure(event, {});
        }

        this.event = event;

        return this;
    }

    async invoke(handler: Function) {
        const response = await handler(this.event.payload, this.context);

        return response;
    }
}