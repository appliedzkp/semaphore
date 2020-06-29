#!/bin/bash

cd "$(dirname "$0")"
mkdir -p ../docs

if [ -f ../docs/CNAME ]; then
    mv ../docs/CNAME ./CNAME_bak
fi

mdbook build . --dest-dir ../docs/ 

if [ -f ./CNAME ]; then
    mv ./CNAME_bak ../docs/
fi
