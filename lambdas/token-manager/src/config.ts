function loadConfig() {
    const env = getEnvVariable("NODE_ENV", "development");
    const appname = getEnvVariable("APP_NAME", "token-manager");
    const dynamo = {
        version: getEnvVariable("DYNAMODB_API_VERSION", "2012-08-10"),
        endpoint: getEnvVariable("DYNAMODB_ENDPOINT", "http://localhost:8000/"),
        region: getEnvVariable("DYNAMODB_REGION", "us-east-1"),
        tablePrefix: getEnvVariable("DYNAMODB_TABLE_PREFIX", "dev-local"),
    };

    return {
        env,
        appname,
        dynamo,
    };
}

function getEnvVariable(name: string, defaultValue: any) {
    let value = process.env && process.env[name];

    return value || defaultValue;
}

export default loadConfig();
