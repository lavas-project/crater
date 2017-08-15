#!/bin/bash
echo "======================== check config ========================"

result=$(node build/validate/index.js | xargs)

if [ "$result" != 'pass' ]
then
    echo 'validate product config fail'
    exit 1
fi

echo 'validate product config complete'

echo "======================== build ========================"
npm run build

echo "======================== build complete ========================"
