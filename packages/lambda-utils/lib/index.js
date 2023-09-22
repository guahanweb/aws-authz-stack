"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchValidation = exports.parseAuthHeader = exports.unauthorized = exports.ok = exports.decodeBasicAuth = exports.encodeBasicAuth = void 0;
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
function encodeBasicAuth(username, password) {
    return Buffer.from(`${username}:${password}`).toString("base64");
}
exports.encodeBasicAuth = encodeBasicAuth;
function decodeBasicAuth(token) {
    const parts = Buffer.from(token, 'base64').toString('ascii').split(':');
    if (parts.length !== 2) {
        throw new Error('basic auth malformed');
    }
    return {
        user: parts[0],
        password: parts[1],
    };
}
exports.decodeBasicAuth = decodeBasicAuth;
function ok(data) {
    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
}
exports.ok = ok;
function unauthorized() {
    return {
        statusCode: 401,
        body: JSON.stringify({
            error: "unauthorized",
        }),
    };
}
exports.unauthorized = unauthorized;
function parseAuthHeader(headers, use_basic = false) {
    let token = null;
    for (let h in headers) {
        if (headers.hasOwnProperty(h) && h.toLowerCase() === 'authorization') {
            const authorization = headers[h];
            const matcher = use_basic ? /^Basic\s+/i : /^Bearer\s+/i;
            token = matcher.test(authorization)
                ? authorization.replace(matcher, '')
                : null;
            if (token === "")
                token = null;
        }
    }
    return token;
}
exports.parseAuthHeader = parseAuthHeader;
function fetchValidation(baseUrl, token) {
    return new Promise((resolve, reject) => {
        const urlPath = `${baseUrl}/validate?token=${token}`;
        const protocol = baseUrl.match(/^https/) ? https_1.default : http_1.default;
        protocol
            .get(urlPath, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    const payload = JSON.parse(data);
                    resolve(payload);
                }
                catch (err) {
                    reject(err);
                }
            });
        })
            .on("error", (err) => {
            console.error(err);
            reject(err);
        });
    });
}
exports.fetchValidation = fetchValidation;
