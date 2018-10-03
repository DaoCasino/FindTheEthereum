#!/usr/bin/env bash
export DC_NETWORK=sdk
export DAPP_ROOM=dapp_room
export DAPP_PATH=$(PWD)/build/
export PRIVATE_KEY=0x8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5

npm run watch_contracts &
npm run dev