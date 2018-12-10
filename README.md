# FindTheEthereum
:gem: Find the ether in one of the three boxes!

## Rules of the game
The player makes a deposit and chooses a bet.
Purpose of the game: guess the casket with the etherium. 
When the player finishes the game, he withdraws the money.

## Dependencies:
- "dc-webapi": "^0.1.35"
- "pixi.js": "4.8.2"

#### Win
- x2

## Table of Contents
- [File structure](#-file-structure)
  - [dapp.manifest.js](#dappmanifest)
  - [dapp.logic.js](#dapplogic)
  
## 📁 File structure
|name|description|
|---|---|
|`dapp.manifest.js`|Configuration file for the **bankroll app**|
|`dapp.logic.js`|The file contains the main logic and is a common file for the **bankroll app** and the client|

### dapp.manifest.js
The application manifest contains basic information about the application and the path to the files.

### dapp.logic.js
The file contains the main logic of the application. The file is shared between the client and server parts.