#!/bin/bash
echo "======================== check config ========================"

node build/validate/index.js

EXCODE=$?
if [ "$EXCODE" != "0" ]
then
    exit $EXCODE
fi

echo "======================== build ========================"
npm run build

EXCODE=$?
if [ "$EXCODE" != "0" ]
then
    exit $EXCODE
fi

echo "======================== build complete ========================"
