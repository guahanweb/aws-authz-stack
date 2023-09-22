import http from "http";
import https from "https";

export function encodeBasicAuth(username: string, password: string) {
    return Buffer.from(`${username}:${password}`).toString("base64");
}

export function decodeBasicAuth(token: string) {
    const parts = Buffer.from(token, 'base64').toString('ascii').split(':');

    if (parts.length !== 2) {
        throw new Error('basic auth malformed');
    }

    return {
        user: parts[0],
        password: parts[1],
    };
}

export function ok(data: any) {
    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
}

export function unauthorized() {
    return {
        statusCode: 401,
        body: JSON.stringify({
            error: "unauthorized",
        }),
    }
}

export function parseAuthHeader(headers: any, use_basic = false) {
    let token: string|null = null;

    for (let h in headers) {
        if (headers.hasOwnProperty(h) && h.toLowerCase() === 'authorization') {
            const authorization = headers[h];
            const matcher = use_basic ? /^Basic\s+/i : /^Bearer\s+/i;

            token = matcher.test(authorization)
                ? authorization.replace(matcher, '')
                : null;

            if (token === "") token = null;
        }
    }

    return token;
}

export function fetchValidation(baseUrl: string, token: string) {
    return new Promise((resolve, reject) => {

        const urlPath = `${baseUrl}/validate?token=${token}`;
        const protocol = baseUrl.match(/^https/) ? https : http;

        protocol
            .get(urlPath, (res: any) => {
                let data = "";

                res.on("data", (chunk: Buffer) => {
                    data += chunk;
                });

                res.on("end", () => {
                    try {
                        const payload = JSON.parse(data);

                        resolve(payload);
                    } catch (err: any) {
                        reject(err);
                    }
                });
            })
            .on("error", (err: any) => {
                console.error(err);
                reject(err);
            });
    })
}