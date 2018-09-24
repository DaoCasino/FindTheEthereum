module.exports = (channel) => {
  var _state
  switch (channel[0].toNumber()) {
    case 0:
      _state = 'unused'
      break
    case 1:
      _state = 'open'
      break
    case 2:
      _state = 'close'
      break
    case 3:
      _state = 'dispute'
      break
  }
  return {
    state: _state,
    player: channel[1],
    bankroller: channel[2],
    playerBalance: channel[3].toNumber(),
    bankrollerBalance: channel[4].toNumber(),
    totalBet: channel[5].toNumber(),
    session: channel[6].toNumber(),
    endBlock: channel[7].toNumber(),
    gameData: channel[8],
    RSAHash: channel[9]
  }
}
