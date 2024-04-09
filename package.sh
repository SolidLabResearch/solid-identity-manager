#!/bin/bash

cd dist || exit;
VERSION=$(node -p -e "require('../package.json').version")
echo $VERSION
zip -r -FS ../releases/solid-identity-manager-$VERSION.zip * --exclude '*.git*'
