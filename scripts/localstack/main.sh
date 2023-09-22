#!/usr/bin/env bash
[[ -f ${DIR}/localstack/settings.sh ]] && source ${DIR}/localstack/settings.sh
[[ -f ${DIR}/localstack/utils.sh ]] && source ${DIR}/localstack/utils.sh

ProgName=$(basename $0)
subcommand=$1

case $subcommand in
    start )
        info "starting localstack in the background."
        LOCALSTACK_DOCKER_NAME=careacademy_localstack docker-compose -f "${DIR}/localstack/docker-compose.yml" up --detach
        info "running. to stop: ${BOLD_WHITE}${ProgName} localstack stop${NC}"
        ;;

    stop )
        info "stopping localstack if running."
        docker-compose -f "${DIR}/localstack/docker-compose.yml" down
        info "done"
        ;;

    setup )
        shift
        source ${DIR}/localstack/setup/main.sh
        ;;

    build )
        [[ ! -d "${LAMBDA_BASE_PATH}" ]] && fail "cloud-functions repo path ${BOLD_WHITE}${LAMBDA_BASE_PATH}${NC} does not exist"
        info "attempting to build lambdas..."
        # for each lambda, run the build script to bundle

        # install runtime dependencies
        # cd ${CLOUD_FUNCTIONS_REPO_PATH} > /dev/null 2>&1
        # info "${BOLD_WHITE}npm install${NC}"
        # npm install > /dev/null 2>&1
        # npm run build -w @caracademy/lambda-authentication

        cd - > /dev/null 2>&1
        ok "done"
        ;;

    * )
        # attempting to set up all environments
        # source ${DIR}/apps/configuration.sh
        # source ${DIR}/apps/event-bus.sh
        # source ${DIR}/apps/state-management.sh
        ;;
esac