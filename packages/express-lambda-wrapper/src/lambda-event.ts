import crypto from 'crypto';
import { Request } from 'express';
import { getRequestTime } from './utils';

export class LambdaEvent {
    private options: any;

    constructor(opts?: any) {
        this.options = opts;
    }

    private getUrl(path: string) {
        // remove the query string from the path, if exists
        let i = path.indexOf('?');

        return i >= 0
            ? path.substring(0, i)
            : path;
    }

    private headers(req: Request) {
        const multiValueHeaders: { [key: string]: string } = {
            // default aws event headers
            'Accept': req.get('accept') || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': req.get('accept-encoding') || 'gzip, deflate, sdch',
            'Accept-Language': req.get('accept-language') || 'en-US,en;q=0.8',
            'Cache-Control': req.get('cache-control') || 'max-age=0',
            'CloudFront-Forwarded-Proto': req.get('cloudfront-forwarded-proto') || 'https',
            'CloudFront-Is-Desktop-Viewer': req.get('cloudfront-is-desktop-viewer') || 'true',
            'CloudFront-Is-Mobile-Viewer': req.get('cloudfront-is-mobile-viewer') || 'false',
            'CloudFront-Is-SmartTV-Viewer': req.get('cloudfront-is-smarttv-viewer') || 'false',
            'CloudFront-Is-Tablet-Viewer': req.get('cloudfront-is-tablet-viewer') || 'false',
            'CloudFront-Viewer-Country': req.get('cloudfront-viewer-country') || 'US',
            'Host': req.get('host') || '1234567890.execute-api.us-east-1.amazonaws.com',
            'Upgrade-Insecure-Requests': req.get('upgrade-insecure-requests') || '1',
            'User-Agent': req.get('user-agent') || 'ADG Automation Express-Lambda Wrapper',
            'Via': req.get('via') || '1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)',
            'X-Amz-Cf-Id': req.get('x-amz-cf-id') || 'cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==',
            'X-Forwarded-For': req.get('x-forwarded-for') || req.ip,
            'X-Forwarded-Port': req.get('x-forwarded-port') || '443',
            'X-Forwarded-Proto': req.get('x-forwarded-proto') || 'https',
        };

        if (this.options && this.options.headers) {
            this.options.headers.forEach((key: string) => {
                const value = req.get(key);

                if (value) multiValueHeaders[key] = value;
            })
        }

        const singleValueHeaders: { [key: string]: string } = {
            // any additional headers we want to be sure to pass along
            'Authorization': req.get('authorization') || '',
        };

        const multiValueHeadersObject: any = {};

        Object.keys(multiValueHeaders).forEach((key: string) => {
            multiValueHeadersObject[key] = [multiValueHeaders[key]];
        })

        // build object for both single and multi value headers
        return [
            { ...multiValueHeaders, ...singleValueHeaders },
            multiValueHeadersObject,
        ];
    }

    private context(req: Request) {
        const requestTime = getRequestTime();

        return {
            accountId: '123456789012',
            resourceId: '123456',
            stage: 'prod',
            requestId: crypto.randomUUID(),
            ...requestTime,
            identity: {
                cognitoIdentityPoolId: null,
                accountId: null,
                cognitoIdentityId: null,
                caller: null,
                accessKey: null,
                sourceIp: req.ip,
                cognitoAuthenticationType: null,
                cognitoAuthenticationProvider: null,
                userArn: null,
                user: null,
            },
        }
    }

    public parse(req: Request) {
        const protocol = this.options?.protocol || 'HTTP/1.1';
        const apiId = this.options?.apiId || '1234567890';
        const path = this.getUrl(req.originalUrl);
        const body = req.body || {};
        const query = req.query || {};
        const method = req.method || 'GET';
        const params = req.params || {};
        const [singleValueHeaders, multiValueHeaders] = this.headers(req);
        const userAgent = singleValueHeaders['User-Agent'];
        const baseContext: any = this.context(req);
        const resourcePath = this.options?.resource || '/{proxy+}';

        return {
            body: JSON.stringify(body),
            resource: this.options?.resource || '/{proxy+}',
            path: path,
            httpMethod: method,
            isBase64Encoded: true,
            queryStringParameters: query,
            multiValueQueryStringParameters: {},
            pathParameters: params,
            stageVariables: {},
            headers: singleValueHeaders,
            multiValueHeaders,
            requestContext: {
                ...baseContext,
                identity: {
                    ...baseContext.identity,
                    userAgent,
                },
                path,
                resourcePath,
                httpMethod: method,
                apiId,
                protocol,
            },
        }
    }
}