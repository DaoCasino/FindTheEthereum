#!/usr/bin/env bash -e

sh `dirname "$0"`/../_env/_scripts/start.sh || exit 1

clear
echo ""
echo " * Run your DApp migrations"
echo ""

BUILD_CONTRACT="./dapp/config/contracts"
if [ -d "$BUILD_CONTRACT" ]; then
  rm -rf $BUILD_CONTRACT
fi

truffle migrate
# truffle migrate || clear && truffle migrate --reset || clear && rm -rf ./dapp/config/contracts && truffle migrate
