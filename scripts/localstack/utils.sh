#!/usr/bin/env bash

function appendPathPart() {
    local apiId=${1}
    local parentId=${2}
    local pathPart=${3}

    aws ${ENDPOINT} apigateway create-resource \
        --region ${AWS_REGION} \
        --rest-api-id ${apiId} \
        --parent-id ${parentId} \
        --path-part ${pathPart} \
        > /dev/null 2>&1

    [ $? == 0 ] || fail "failed to create resource: ${BOLD_WHITE}${pathPart}${NC}"
    aws ${ENDPOINT} apigateway get-resources \
        --rest-api-id ${apiId} \
        --query 'items[?pathPart==`'${pathPart}'`].id' \
        --output text \
        --region ${AWS_REGION} \
        | xargs
}
