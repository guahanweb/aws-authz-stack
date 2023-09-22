import path from "path";
import fs from "fs";
import config from "./config";
import { lambda } from "./index";

// load in the actual payloads that will be used as the event baseline
const defaultEvents = (function () {
    const authorizer = JSON.parse(fs.readFileSync(path.join(config.dataPath, "apigateway-authorizer/event.json")).toString());
    const proxy = JSON.parse(fs.readFileSync(path.resolve(config.dataPath, "apigateway-aws-proxy/event.json")).toString());

    return {
        authorizer,
        proxy,
    };
}());

describe ("lambda(): primary function", () => {
    describe ("chained event types", () => {
        it ("should provide chains for supported event types", async () => {
            const executor = lambda();

            expect(executor.proxy).toBeInstanceOf(Function);
            expect(executor.authorizer).toBeInstanceOf(Function);
            expect(executor.invoke).toBeInstanceOf(Function);
        });

        it ("should fail when calling two event types in one chain", async () => {
            const executor = lambda();

            executor.proxy((event: any, context: any) => {});
            expect(executor.authorizer).toThrowError();

            const executor2 = lambda();

            executor2.authorizer((event: any, context: any) => {});
            expect(executor2.proxy).toThrowError();
        });
    });

    describe ("handler invocation check", () => {
        it ("should call the authorizer handler with correct event", async () => {
            const handler = jest.fn();
            const response = lambda()
                .authorizer()
                .invoke(handler);

            expect(handler).toHaveBeenCalled();
            expect(handler.mock.lastCall[0]).toEqual(defaultEvents.authorizer);
        });

        it ("should call the proxy handler with correct event", async () => {
            const handler = jest.fn();
            const response = lambda()
                .proxy()
                .invoke(handler);

            expect(handler).toHaveBeenCalled();
            expect(handler.mock.lastCall[0]).toEqual(defaultEvents.proxy);
        });
    });

    describe ("custom event overrides", () => {
        it ("should override basic proxy events", async () => {
            const handler = jest.fn();
            const response = lambda()
                .proxy((event: any, context: any) => {
                    event.body(["a", "b", "c"])
                    event.header("X-Test-Framework", "Jest")
                })
                .invoke(handler);

            const [event, context] = handler.mock.lastCall;
            const payload = JSON.parse(event.body);
            const headers = event.headers;

            expect(event).not.toEqual(defaultEvents.proxy);
            expect(payload).toEqual(["a", "b", "c"]);
            expect(headers["X-Test-Framework"]).toEqual("Jest");
        });
    });
});