import { fetchValidation } from "@careacademy/lambda-utils";

const config = {
    endpoint: loadFromEnv("AUTH_ENDPOINT", null),
    allowedScopes: loadScopesArray(),
}

async function handler(event: any, context: any) {
    try {
        const token = event.authorizationToken;
        const valid = token.match(/^bearer\s+(.*)$/i);

        // we need to be sure we have only the token from the header
        if (!valid) return "Unauthorized";

        const response: any = await fetchValidation(config.endpoint, valid[1]);

        // invalid token, so 401
        if (response.token === null ) return "Unauthorized";

        // if configured with allowed scopes, assure the token has the right one
        if (config.allowedScopes && config.allowedScopes.length) {
            const hasScopes = response.token.scopes.some((scope: string) => config.allowedScopes.includes(scope));

            if (!hasScopes) {
                // we will actively deny due to missing scopes
                return generatePolicy("user", "Deny", event.methodArn);
            }
        }

        // if we reach this point, we have a valid token, so allow
        return generatePolicy("user", "Allow", event.methodArn);
    } catch (err: any) {
        return "Unauthorized";
    }

}

function generatePolicy(principalId: string, effect?: string, resource?: string) {
    const authResponse: any = { principalId };

    if (effect && resource) {
        const policyDocument: any = {
            Version: "2012-10-17",
            Statement: [],
        };

        const statementOne = {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: resource,
        };

        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    // Optional output with custom properties of the String, Number or Boolean type
    authResponse.context = {};

    return authResponse;
}

function loadFromEnv(name: string, defaultValue: any) {
    const value = process.env && process.env[name];

    return value || defaultValue;
}

function loadScopesArray() {
    const scopes = loadFromEnv("AUTH_ALLOWED_SCOPES", "")
        .split(",")
        .filter((scope: string) => scope) // TODO: any filtering
        .map((scope: string) => scope.trim().toLowerCase());

    return scopes.length ? scopes : null;
}

export { handler };