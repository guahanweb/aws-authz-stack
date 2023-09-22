function build_lambda() {
    workspace=$1
    cd ${PROJECT_ROOT}/lambdas/${workspace}
    rm -rf dist

    if [ -f ./tsconfig.json ]
    then
        # just build the local tsconfig
        npx tsc
    else
        # use the shared lambda tsconfig
        configpath="${PROJECT_ROOT}/packages/config-tsconfig"
        ln -s "${configpath}/base.json" base.json
        ln -s "${configpath}/node.json" node.json
        ln -s "${configpath}/lambda.json" tsconfig.lambda.json

        # build and remove
        npx tsc --project tsconfig.lambda.json
        rm tsconfig.lambda.json
        rm node.json
        rm base.json
    fi
}

function pull_dependencies() {
    workspace=$1
    [ ! -d "${PROJECT_ROOT}/lambdas/${workspace}/dist" ] && echo "dist folder does not exist, stopping!" && exit 1
    cd ${PROJECT_ROOT}/lambdas/${workspace}/dist

    mkdir -p node_modules/@careacademy
    ln ../package.json package.json

    # link up our local dependencies
    ln -s "${PROJECT_ROOT}/packages/common-dynamodb" node_modules/@careacademy/common-dynamodb
    ln -s "${PROJECT_ROOT}/packages/config-tsconfig" node_modules/@careacademy/config-tsconfig
    ln -s "${PROJECT_ROOT}/packages/lambda-mocks" node_modules/@careacademy/lambda-mocks
    ln -s "${PROJECT_ROOT}/packages/lambda-utils" node_modules/@careacademy/lambda-utils
    ln -s "${PROJECT_ROOT}/packages/config-eslint" node_modules/eslint-config-careacademy

    npm install --omit=dev --ignore-scripts
    [ $? == 0 ] || fail "unable to install NPM dependencies"

    rm package*.json
}

function package_lambda() {
    workspace=$1
    local version="$( cat "${PROJECT_ROOT}/lambdas/${workspace}/package.json" | jq -r .version )"
    cd ${PROJECT_ROOT}/lambdas/${workspace}/dist
    zip -r -X "../bundle-${version}.zip" .
}
