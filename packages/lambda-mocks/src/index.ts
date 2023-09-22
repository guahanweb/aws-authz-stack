import { lambda } from "./lambda-executor";
import { handler } from "./example-lambda";

if (require.main === module) {
    main();
}

function main() {
    const result = lambda()
        .proxy((event: any) => {
            event
                .header("Authorization", "BEARER aasdf28880")
                .body({ "foo": "bar" })
                .method("PUT");
        })
        .invoke(handler);

    // test result here
}

export {
    lambda,
};