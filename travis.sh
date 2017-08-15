#!/bin/bash

runCommand() {
    eval "$*"
    EXITCODE=$?

    if [ $EXITCODE != 0 ]; then
        exit $EXITCODE
    fi
}

echo "======================== check config ========================"

runCommand "node build/validate/index.js"
runCommand "npm run lint"

echo "======================== build ========================"

runCommand "npm run build"

echo "======================== build complete ========================"
