#!/usr/bin/env bash
clear
echo ""
echo " * Check docker & docker-compose is installed..."
echo ""

if ! [ -x "$(command -v docker-compose)" ]; then

  URL="https://docs.docker.com/install"
  URL_MAC="https://docs.docker.com/docker-for-mac/install/"
  URL_LINUX="https://docs.docker.com/install/linux/docker-ce/ubuntu/"
  URL_WIN="https://docs.docker.com/docker-for-windows/install/"
  clear
  echo ""
  echo "   Warning: docker-compose is not installed" >&2
  echo "   Read instructions: $URL"
  echo ""
  sleep 3
  if ! [ -x "$(command -v python)" ]; then
    python -mwebbrowser $URL
  else
    case "$OSTYPE" in
      darwin*)  open $URL_MAC ;;
      linux*)   xdg-open $URL_LINUX ;;
      bsd*)     xdg-open $URL ;;
      msys*)    start $URL_WIN ;;
      *)        echo "Can't find browser" ;;
    esac
  fi

  exit 1
fi

clear
echo ""
echo " * Check docker daemon is run..."
echo ""

if [ $(uname) = Linux ]; then 
  withSudo="sudo"
else
  withSudo=""
fi

$withSudo docker ps || sleep 7

clear