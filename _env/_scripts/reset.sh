sh `dirname "$0"`/check_docker.sh || exit 1
sh `dirname "$0"`/stop.sh || exit 1

clear
echo ""
echo " * Remove docker containers..."
echo ""

cd `dirname "$0"`/../
if [ $(uname) = Linux ]; then 
  withSudo="sudo"
else
  withSudo=""
fi


$withSudo docker-compose rm -f  || exit 1

clear
echo ""
echo " * Clean builded contracts..."
echo ""
rm -rf ./protocol/contracts >> /dev/null &
rm ./protocol/addresses.json >> /dev/null &

rm -rf ./tmp