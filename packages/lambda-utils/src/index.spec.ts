import {
    parseAuthHeader,
    ok,
    unauthorized,
    encodeBasicAuth,
    decodeBasicAuth
} from "./index"

describe("BASIC auth encoding", () => {
    it ("should encode headers correctly", () => {
        const username = "foo";
        const password = "bar";
        const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

        expect(encodeBasicAuth(username, password)).toEqual(basicAuth);
    });
});

// parseAuthHeader()
describe("Parsing Authorization Headers", () => {
    let basicAuth: string;
    let bearerToken: string;

    beforeAll(() => {
        basicAuth = Buffer.from("foo:bar").toString("base64");
        bearerToken = "foobar";
    });

    it ("should recognize basic auth", () => {
        const headers = { "Authorization": `BASIC ${basicAuth}` };
        const validToken = parseAuthHeader(headers, true);

        expect(validToken).toEqual(basicAuth);
    });

    it ("should only match basic auth with flag", () => {
        const headers = { "Authorization": `basic ${basicAuth}` };
        const invalidToken = parseAuthHeader(headers);

        expect(invalidToken).not.toEqual(basicAuth);
    });

    it ("should recognize bearer tokens", () => {
        const headers = { "Authorization": `Bearer ${bearerToken}` };
        const validToken = parseAuthHeader(headers);

        expect(validToken).toEqual(bearerToken);
    });
});

// ok()
describe("Building Valid Response", () => {
    it ("should return a valid payload with statusCode and body", () => {
        const data = { sample: "this is my data" };
        const dataString = JSON.stringify(data);
        const response = ok(data);

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual(dataString);
    });
});

// unauthorized()
describe("Building Unauthorized Response", () => {
    it ("should return a valid payload with statusCode", () => {
        const response = unauthorized();
        const payload = JSON.parse(response.body);

        expect(response.statusCode).toEqual(401);
        expect(payload.error).toBeDefined();
        expect(payload.error).toEqual("unauthorized");
    });
});

// decodeBasicAuth()
describe("Decoding BASIC authorization", () => {
    it ("should decipher and return token parts", () => {
        const username = "foo";
        const password = "bar";
        const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
        const credentials = decodeBasicAuth(basicAuth);

        expect(credentials.user).toBeDefined();
        expect(credentials.user).toEqual(username);
        expect(credentials.password).toBeDefined();
        expect(credentials.password).toEqual(password);
    });
});