#!/usr/bin/env bash

# we need to be able to reference localstack
export ENDPOINT=""
[[ ! -z "${AWS_ENDPOINT_URL}" ]] && export ENDPOINT="--endpoint-url ${AWS_ENDPOINT_URL}"

function delete_table() {
    tableName=$1
    [[ ! -z "${DYNAMODB_TABLE_PREFIX}" ]] && tableName="${DYNAMODB_TABLE_PREFIX}-${tableName}"

    aws ${ENDPOINT} dynamodb describe-table \
        --region ${AWS_REGION} \
        --table-name ${tableName} \
        > /dev/null 2>&1

    if [ $? == 0 ]
    then
        # table exists
        aws ${ENDPOINT} dynamodb delete-table \
            --region ${AWS_REGION} \
            --table-name ${tableName} \
            > /dev/null

        info "successfully deleted table: ${BOLD_WHITE}${tableName}${NC}"
    else
        info "dynamodb table does not exist, nothing to do: ${BOLD_WHITE}${tableName}${NC}"
    fi
}

function create_table_api_keys() {
    tableName="apiKeySchema"
    [[ ! -z "${DYNAMODB_TABLE_PREFIX}" ]] && tableName="${DYNAMODB_TABLE_PREFIX}-${tableName}"

    aws ${ENDPOINT} dynamodb describe-table \
        --region ${AWS_REGION} \
        --table-name ${tableName} \
        > /dev/null 2>&1

    if [ $? == 0 ]
    then
        info "dynamodb table already exists: ${BOLD_WHITE}${tableName}${NC}"
    else
        aws ${ENDPOINT} dynamodb create-table \
            --region ${AWS_REGION} \
            --table-name ${tableName} \
            --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S AttributeName=pData,AttributeType=S AttributeName=sData,AttributeType=S \
            --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
            --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
            --tags Key=Owner,Value=careacademy-engineering \
            --global-secondary-indexes \
                "[
                    {
                        \"IndexName\": \"sk-pData\",
                        \"KeySchema\": [
                            { \"AttributeName\": \"sk\", \"KeyType\": \"HASH\" },
                            { \"AttributeName\": \"pData\", \"KeyType\": \"RANGE\" }
                        ],
                        \"ProvisionedThroughput\": { \"ReadCapacityUnits\": 10, \"WriteCapacityUnits\": 5 },
                        \"Projection\": { \"ProjectionType\": \"ALL\" }
                    }
                ]" \
            > /dev/null 2>&1

        [ $? == 0 ] || fail "failed to create dynamodb table ${BOLD_WHITE}${tableName}${NC}"
        info "successfully created dynamodb table ${BOLD_WHITE}${tableName}${NC}"

        # aws ${ENDPOINT} dynamodb update-time-to-live \
        #     --region ${AWS_REGION}
    fi
}

function create_table_auth_tokens() {
    tableName="authTokenSchema"
    [[ ! -z "${DYNAMODB_TABLE_PREFIX}" ]] && tableName="${DYNAMODB_TABLE_PREFIX}-${tableName}"

    aws ${ENDPOINT} dynamodb describe-table \
        --region ${AWS_REGION} \
        --table-name ${tableName} \
        > /dev/null 2>&1

    if [ $? == 0 ]
    then
        info "dynamodb table already exists: ${BOLD_WHITE}${tableName}${NC}"
    else
        aws ${ENDPOINT} dynamodb create-table \
            --region ${AWS_REGION} \
            --table-name ${tableName} \
            --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
            --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
            --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
            --tags Key=Owner,Value=careacademy-engineering \
            > /dev/null 2>&1

        [ $? == 0 ] || fail "failed to create dynamodb table ${BOLD_WHITE}${tableName}${NC}"
        info "successfully created dynamodb table ${BOLD_WHITE}${tableName}${NC}"

        aws ${ENDPOINT} dynamodb update-time-to-live \
            --region ${AWS_REGION} \
            --table-name ${tableName} \
            --time-to-live-specification Enabled=true,AttributeName=ttl \
            > /dev/null 2>&1

        [ $? == 0 ] || fail "failed to update TTL for table ${BOLD_WHITE}${tableName}${NC}"
        info "successfully updated TTL for table ${BOLD_WHITE}${tableName}${NC}"
    fi
}

function update_lambda() {
    functionName="LocalStackTokenHandler"
    zipFile="${LAMBDA_BASE_PATH}/token-manager/bundle-${LAMBDA_TOKEN_MANAGER_VERSION}.zip"

    aws ${ENDPOINT} lambda update-function-code \
        --region ${AWS_REGION} \
        --function-name ${functionName} \
        --zip-file fileb://${LAMBDA_BASE_PATH}/token-manager/bundle-${LAMBDA_TOKEN_MANAGER_VERSION}.zip \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to update code for ${BOLD_WHITE}${functionName}${NC} lambda"
    info "successfully updated code for ${BOLD_WHITE}${functionName}${NC} lambda"

    aws ${ENDPOINT} lambda update-function-configuration \
        --region ${AWS_REGION} \
        --function-name ${functionName} \
        --environment "Variables={AWS_REGION=${AWS_REGION},DYNAMODB_TABLE_PREFIX=${DYNAMODB_TABLE_PREFIX},DYNAMODB_ENDPOINT=http://host.docker.internal:4566}" \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to update configuration for ${BOLD_WHITE}${functionName}${NC} lambda"
    info "successfully updated configuration for ${BOLD_WHITE}${functionName}${NC} lambda"

    # Validation lambda
    functionName="LocalStackValidationHandler"
    zipFile="${LAMBDA_BASE_PATH}/token-manager/bundle-${LAMBDA_TOKEN_MANAGER_VERSION}.zip"

    aws ${ENDPOINT} lambda update-function-code \
        --region ${AWS_REGION} \
        --function-name ${functionName} \
        --zip-file fileb://${LAMBDA_BASE_PATH}/token-manager/bundle-${LAMBDA_TOKEN_MANAGER_VERSION}.zip \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to update code for ${BOLD_WHITE}${functionName}${NC} lambda"
    info "successfully updated code for ${BOLD_WHITE}${functionName}${NC} lambda"

    aws ${ENDPOINT} lambda update-function-configuration \
        --region ${AWS_REGION} \
        --function-name ${functionName} \
        --environment "Variables={AWS_REGION=${AWS_REGION},DYNAMODB_TABLE_PREFIX=${DYNAMODB_TABLE_PREFIX},DYNAMODB_ENDPOINT=http://host.docker.internal:4566}" \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to update configuration for ${BOLD_WHITE}${functionName}${NC} lambda"
    info "successfully updated configuration for ${BOLD_WHITE}${functionName}${NC} lambda"
}

function delete_lambda() {
    functionName=${1}

    aws ${ENDPOINT} lambda get-function --function-name ${functionName} > /dev/null 2>&1

    if [ $? == 0 ]
    then
        aws ${ENDPOINT} lambda delete-function \
            --region ${AWS_REGION} \
            --function-name ${functionName} \
            > /dev/null 2>&1

        [ $? == 0 ] || fail "unable to delete lambda: ${BOLD_WHITE}${functionName}${NC}"
        info "successfully deleted lambda: ${BOLD_WHITE}${functionName}${NC}"
    else
        info "lambda does not exist: ${BOLD_WHITE}${functionName}${NC}"
    fi
}

function create_auth_api() {
    # create lambda functions
    tokenFunctionName="LocalStackTokenHandler"
    zipFile="${LAMBDA_BASE_PATH}/token-manager/bundle-${LAMBDA_TOKEN_MANAGER_VERSION}.zip"

    aws ${ENDPOINT} lambda create-function \
        --region ${AWS_REGION} \
        --function-name ${tokenFunctionName} \
        --runtime ${LAMBDA_AUTH_RUNTIME} \
        --handler ${LAMBDA_CREATE_TOKEN_HANDLER} \
        --zip-file fileb://${zipFile} \
        --role arn:aws:iam::000000000000:role/inconsequential \
        --environment "Variables={AWS_REGION=${AWS_REGION},DYNAMODB_TABLE_PREFIX=${DYNAMODB_TABLE_PREFIX},DYNAMODB_ENDPOINT=http://host.docker.internal:4566}" \
        > /dev/null 2>&1
    
    [ $? == 0 ] || fail "failed to create lambda: ${BOLD_WHITE}${tokenFunctionName}${NC}"
    tokenFunctionArn=$( aws ${ENDPOINT} --region ${AWS_REGION} lambda list-functions --query "Functions[?FunctionName==\`${tokenFunctionName}\`].FunctionArn" --output text )
    info "successfully created lambda: ${BOLD_WHITE}${tokenFunctionName}${NC}"

    # Validation lambda
    validationFunctionName="LocalStackValidationHandler"
    zipFile="${LAMBDA_BASE_PATH}/token-manager/bundle-${LAMBDA_TOKEN_MANAGER_VERSION}.zip"

    aws ${ENDPOINT} lambda create-function \
        --region ${AWS_REGION} \
        --function-name ${validationFunctionName} \
        --runtime ${LAMBDA_AUTH_RUNTIME} \
        --handler ${LAMBDA_VALIDATE_TOKEN_HANDLER} \
        --zip-file fileb://${zipFile} \
        --role arn:aws:iam::000000000000:role/inconsequential \
        --environment "Variables={AWS_REGION=${AWS_REGION},DYNAMODB_TABLE_PREFIX=${DYNAMODB_TABLE_PREFIX},DYNAMODB_ENDPOINT=http://host.docker.internal:4566}" \
        > /dev/null 2>&1
    
    [ $? == 0 ] || fail "failed to create lambda: ${BOLD_WHITE}${validationFunctionName}${NC}"
    validationFunctionArn=$( aws ${ENDPOINT} --region ${AWS_REGION} lambda list-functions --query "Functions[?FunctionName==\`${validationFunctionName}\`].FunctionArn" --output text )
    info "successfully created lambda: ${BOLD_WHITE}${validationFunctionName}${NC}"

    apiName="LocalStackAuthApi"
    aws ${ENDPOINT} apigateway create-rest-api \
        --region ${AWS_REGION} \
        --name ${apiName} \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to create rest api: ${BOLD_WHITE}${apiName}${NC}"

    apiId=$( aws ${ENDPOINT} apigateway get-rest-apis --query "items[?name==\`${apiName}\`].id" --output text --region ${AWS_REGION} )
    rootId=$( aws ${ENDPOINT} apigateway get-resources --rest-api-id ${apiId} --query "items[?path==\`/\`].id" --output text --region ${AWS_REGION} )
    info "successfully created ${BOLD_WHITE}${apiName}${NC} rest api with id ${CYAN}${apiId}${NC}"

    # create path: /token
    tokenPathId=$( appendPathPart ${apiId} ${rootId} token )
    info "path added: ${BOLD_WHITE}/token${NC} with id ${CYAN}${tokenPathId}${NC}"

    # POST method for /token
    aws ${ENDPOINT} apigateway put-method \
        --region ${AWS_REGION} \
        --rest-api-id ${apiId} \
        --resource-id ${tokenPathId} \
        --http-method POST \
        --authorization-type NONE \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to add API method: ${BOLD_WHITE}POST /token${NC}"
    info "API method created: ${BOLD_WHITE}POST /token${NC}"

    # lambda integration
    aws ${ENDPOINT} apigateway put-integration \
        --region ${AWS_REGION} \
        --rest-api-id ${apiId} \
        --resource-id ${tokenPathId} \
        --http-method POST \
        --integration-http-method POST \
        --type AWS_PROXY \
        --uri "arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${tokenFunctionArn}/invocations" \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to add lambda integration: ${BOLD_WHITE}POST /token${NC}"
    info "successfully added lambda integration: ${BOLD_WHITE}POST /token${NC}"

    # create path: /validate
    validatePathId=$( appendPathPart ${apiId} ${rootId} validate )
    info "path added: ${BOLD_WHITE}/validate${NC} with id ${CYAN}${validatePathId}${NC}"

    # GET method for /validate
    aws ${ENDPOINT} apigateway put-method \
        --region ${AWS_REGION} \
        --rest-api-id ${apiId} \
        --resource-id ${validatePathId} \
        --http-method GET \
        --authorization-type NONE \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to add API method: ${BOLD_WHITE}GET /validate${NC}"
    info "API method created: ${BOLD_WHITE}GET /validate${NC}"

    # lambda integration
    aws ${ENDPOINT} apigateway put-integration \
        --region ${AWS_REGION} \
        --rest-api-id ${apiId} \
        --resource-id ${validatePathId} \
        --http-method GET \
        --integration-http-method POST \
        --type AWS_PROXY \
        --uri "arn:aws:apigateway:${AWS_REGION}:lambda:path/2015-03-31/functions/${validationFunctionArn}/invocations" \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to add lambda integration: ${BOLD_WHITE}GET /validate${NC}"
    info "successfully added lambda integration: ${BOLD_WHITE}GET /validate${NC}"

    # deploy the api
    aws ${ENDPOINT} apigateway create-deployment \
        --region ${AWS_REGION} \
        --rest-api-id ${apiId} \
        --stage-name Dev \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to create API deployment"
    info "successfully deployed ${BOLD_WHITE}${apiName}:Dev${NC} rest api"

    localPath="/restapis/${apiId}/Dev/_user_request_"
    echo ""
    echo "${YELLOW}[local dev]${NC} the following routes are available:"
    echo "${BOLD_WHITE}POST ${localPath}/token${NC}"
    echo "${BOLD_WHITE}GET ${localPath}/validate${NC}"

    tokenLogGroup="/aws/lambda/${tokenFunctionName}"
    validationLogGroup="/aws/lambda/${validationFunctionName}"
    tokenLogCommand="aws logs tail ${tokenLogGroup} --follow --since 5m --region ${AWS_REGION} ${ENDPOINT}"
    validationLogCommand="aws logs tail ${validationLogGroup} --follow --since 5m --region ${AWS_REGION} ${ENDPOINT}"
    echo ""
    info "Tail the token lambda logs:"
    echo "${BOLD_WHITE}${tokenLogCommand}${NC}"
    echo ""
    info "Tail the validation lambda logs:"
    echo "${BOLD_WHITE}${validationLogCommand}${NC}"
    echo ""
    echo "${YELLOW}NOTE:${NC} log groups will not be available until after first invocation"
}

function delete_auth_api() {
    apiName="LocalStackAuthApi"
    apiId=$( aws ${ENDPOINT} apigateway get-rest-apis --query "items[?name==\`${apiName}\`].id" --output text --region ${AWS_REGION} )

    if [ ! -z "${apiId}" ]
    then
        for api in $apiId
        do
            aws ${ENDPOINT} apigateway delete-rest-api \
                --region ${AWS_REGION} \
                --rest-api-id ${api} \
                > /dev/null 2>&1

            [ $? == 0 ] || fail "failed to delete rest api: ${BOLD_WHITE}${apiName}${NC}"
            info "successfully deleted rest api: ${BOLD_WHITE}${apiName}${NC}"
        done
    else
        info "apigateway does not exist: ${BOLD_WHITE}${apiName}${NC}"
    fi

}

ProgName=$(basename $0)
subcommand=$1

case $subcommand in
    delete-tables )
        delete_table authTokenSchema
        delete_table apiKeySchema
        ;;

    create-api)
        create_auth_api
        ;;

    delete-api)
        delete_auth_api
        delete_lambda LocalStackTokenHandler
        delete_lambda LocalStackValidationHandler
        ;;

    update-function)
        update_lambda
        ;;

    populate-demo)
        cd ${PROJECT_ROOT} > /dev/null 2>&1
        DYNAMODB_ENDPOINT="http://127.0.0.1:4566" \
            DYNAMODB_REGION="${AWS_REGION}" \
            DYNAMODB_TABLE_PREFIX="${DYNAMODB_TABLE_PREFIX}" \
            npm run populate -w @careacademy/token-manager
        ;;

    * )
        create_table_api_keys
        create_table_auth_tokens
        ;;
esac
