#!/bin/bash

runCommand() {
    typeset cmd="$*"
    typeset result

    eval $cmd
    result=$?

    if [ $result != 0 ]; then
        exit $result
    fi
}

echo "======================== check config ========================"

runCommand "node build/validate/index.js"
runCommand "npm run lint"

echo "======================== build ========================"

runCommand "npm run build"

echo "======================== build complete ========================"
