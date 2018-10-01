sh `dirname "$0"`/stop.sh  || exit 1
sh `dirname "$0"`/../_env/_scripts/reset.sh  || exit 1



clear
echo ""
echo " * Remove ./build folder"
echo ""
sleep 2
rm -rf ./build
rm -rf ./dapp/config/contracts
