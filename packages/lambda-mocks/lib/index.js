"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambda = void 0;
const lambda_executor_1 = require("./lambda-executor");
Object.defineProperty(exports, "lambda", { enumerable: true, get: function () { return lambda_executor_1.lambda; } });
const example_lambda_1 = require("./example-lambda");
if (require.main === module) {
    main();
}
function main() {
    const result = (0, lambda_executor_1.lambda)()
        .proxy((event) => {
        event
            .header("Authorization", "BEARER aasdf28880")
            .body({ "foo": "bar" })
            .method("PUT");
    })
        .invoke(example_lambda_1.handler);
    // test result here
}
