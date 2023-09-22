export declare function encodeBasicAuth(username: string, password: string): string;
export declare function decodeBasicAuth(token: string): {
    user: string;
    password: string;
};
export declare function ok(data: any): {
    statusCode: number;
    body: string;
};
export declare function unauthorized(): {
    statusCode: number;
    body: string;
};
export declare function parseAuthHeader(headers: any, use_basic?: boolean): string | null;
export declare function fetchValidation(baseUrl: string, token: string): Promise<unknown>;
//# sourceMappingURL=index.d.ts.map