#!/usr/bin/env bash
export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null 2>&1 && pwd )"
export PROJECT_ROOT="$( dirname $( dirname "${DIR}" ) )"
export WORKSPACE="$( basename "$( pwd )" )"

[[ -f ${DIR}/utils.sh ]] && source ${DIR}/utils.sh

subcommand=$1

case $subcommand in
    build )
        shift
        workspace=$1
        [[ -z "${workspace}" ]] && info "no workspace provided" && exit 1

        workspacepath="${PROJECT_ROOT}/lambdas/${workspace}"
        [[ ! -d "${workspacepath}" ]] && fail "lambda doesn't exist: ${BOLD_WHITE}${workspacepath}${NC}"

        info "building lambda for ${BOLD_WHITE}${workspace}${NC}"
        build_lambda $workspace
        pull_dependencies $workspace
        package_lambda $workspace
        ;;

    * )

        ;;
esac