
# DAO.Casino SDK 

### (!) Attention: To avoid conflicts with other testrpcs on your host machine, use *port 1406* 
### TESTRPC PORT: 1406

Make sure you have installed [https://docs.docker.com/install/](docker-compose), it is required for the dev environment

## Requirements
 - docker-compose
 - nodejs (10 recommend)
 - trufflejs (npm i -g truffle)


## Quick start
```
mkdir ./myDapp && cd ./myDapp
truffle unbox DaoCasino/SDK && npm start
```
or

```
git clone --depth=1 https://github.com/DaoCasino/SDK ./myDapp
cd ./myDapp
npm i && npm start
```

[![asciicast](https://asciinema.org/a/0tIUXlfpzbqBRug8zjmlUDU9a.png)](https://asciinema.org/a/0tIUXlfpzbqBRug8zjmlUDU9a)


## DApp Core files
Your dapp core files 
./contracts/myDAppGame.sol
dapp/dapp.logic.js
dapp/* 

### TestRPC info
Ganache CLI v6.1.6 (ganache-core: 2.1.5)

Available Accounts
==================
(0) 0x627306090abab3a6e1400e9345bc60c78a8bef57 (~100000 ETH)
(1) 0xf17f52151ebef6c7334fad080c5704d77216b732 (~100000 ETH)
(2) 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef (~100000 ETH)
(3) 0x821aea9a577a9b44299b9c15c88cf3087f3b5544 (~100000 ETH)
(4) 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2 (~100000 ETH)
(5) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e (~100000 ETH)
(6) 0x2191ef87e392377ec08e7c08eb105ef5448eced5 (~100000 ETH)
(7) 0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5 (~100000 ETH)
(8) 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc (~100000 ETH)
(9) 0x5aeda56215b167893e80b4fe645ba6d5bab767de (~100000 ETH)

Private Keys
==================
(0) 0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3
(1) 0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f
(2) 0x0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1
(3) 0xc88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c
(4) 0x388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418
(5) 0x659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63
(6) 0x82d052c865f5763aad42add438569276c00d3d88a2d062d36b2bae914d58b8c8
(7) 0xaa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7
(8) 0x0f62d96d6675f32685bbdb8ac13cda7c23436f63efbb9d07700d8669ff12b7c4
(9) 0x8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5

HD Wallet
==================
Mnemonic:      candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
Base HD Path:  m/44'/60'/0'/0/{account_index}

Gas Limit
==================
7992181


## Docs

https://github.com/DaoCasino/SDK/wiki/2.1.-Development-Stack

