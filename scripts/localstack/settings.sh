#!/usr/bin/env bash
export LAMBDA_CONTAINER_REGISTRY=mlupin/docker-lambda

# be sure we have all the default values, in case CLI is not configured
export AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-000111000111}
export AWS_REGION=${AWS_REGION:-us-east-1}
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-test}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-test}
export AWS_PROFILE=${AWS_PROFILE:-default}
export AWS_ENDPOINT_URL=http://localhost:4566

# set up dynamo table prefix
export DYNAMODB_TABLE_PREFIX=${DYNAMODB_TABLE_PREFIX:-dev-local}

# Environment baseline
export LAMBDA_BASE_PATH=${LAMBDA_BASE_PATH:-"$PROJECT_ROOT/lambdas"}
export LAMBDA_DEFAULT_HANDLER=lambda.handler
export LAMBDA_DEFAULT_RUNTIME=nodejs18.x
export LAMBDA_TOKEN_MANAGER_VERSION=${LAMBDA_TOKEN_MANAGER_VERSION:-1.0.0}
export LAMBDA_CREATE_TOKEN_HANDLER=lambda.generateToken
export LAMBDA_VALIDATE_TOKEN_HANDLER=lambda.validateToken

# Authentication configuration
export LAMBDA_AUTH_TEMPLATE_DIR=${LAMBDA_AUTH_TEMPLATE_DIR:-"${CLOUD_FUNCTIONS_REPO_PATH}/authentication/data"}
export LAMBDA_AUTH_VERSION=${LAMBDA_AUTH_VERSION:-1.0.0}
export LAMBDA_AUTH_ZIP=${LAMBDA_AUTH_ZIP:-"${CLOUD_FUNCTIONS_REPO_PATH}/authentication/${LAMBDA_AUTH_VERSION}.zip"}
export LAMBDA_AUTH_HANDLER=${LAMBDA_AUTH_HANDLER:-"${LAMBDA_DEFAULT_HANDLER}"}
export LAMBDA_AUTH_RUNTIME=${LAMBDA_AUTH_RUNTIME:-"${LAMBDA_DEFAULT_RUNTIME}"}
export LAMBDA_AUTH_DYNAMODB_TABLE=""