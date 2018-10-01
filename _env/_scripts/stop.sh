#!/bin/bash 
clear
echo ""
echo " * Stop DC docker containers... "
echo ""

cd `dirname "$0"`/../

if [ $(uname) = Linux ]; then 
  withSudo="sudo"
else
  withSudo=""
fi


$withSudo docker ps || sleep 7

docker-compose down || exit 1
