import { handler } from "./lambda";
import { fetchValidation } from "@careacademy/lambda-utils";
import { lambda } from "@careacademy/lambda-mocks";

jest.mock("@careacademy/lambda-utils", () => {
    const originalModule = jest.requireActual("@careacademy/lambda-utils");
    
    return {
        ...originalModule,
        fetchValidation: jest.fn().mockName("fetch validation"),
    };
});

function buildToken(token: string, scopes: string[]) {
    return {
        token: {
            access_token: `bearer ${token}`,
            scopes,
        }
    }
}

describe("Authorizer lambda", () => {
    const methodArn = "arn:aws:lambda:us-east-1:000111000111:function:caAuthServiceAuthorizerTest";
    let lambdaExecutor;

    beforeEach(() => {
        lambdaExecutor = lambda()
            .authorizer((event: any) => {
                event
                    .methodArn(methodArn)
                    .authorizationToken("bearer FOOBAR");
            });
    });

    it ("should allow access on valid token", async () => {
        // return a successful token response
        (fetchValidation as any).mockReturnValueOnce(buildToken("FOOBAR", ["stub:testing:test"]));

        const result: any = await lambdaExecutor.invoke(handler);
        const statement = result.policyDocument.Statement[0];

        expect(result.principalId).toEqual("user");
        expect(statement.Action).toEqual("execute-api:Invoke");
        expect(statement.Effect).toEqual("Allow");
        expect(statement.Resource).toEqual(methodArn);

        return true;
    });

    it ("should be unauthorized without a token", async () => {
        // return a null token response
        (fetchValidation as any).mockReturnValueOnce({ token: null });

        const result = await lambdaExecutor.invoke(handler);

        expect(result).toEqual("Unauthorized");
    });
});