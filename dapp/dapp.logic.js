export default function () {
  return {
    play: function (userBets, gameData, randoms) {
      const USER_BET = userBets[0]
      const USER_NUM = gameData.custom.playerNumbers.v[0]
      const RANDOM_NUM = randoms[0]

      let profit = -USER_BET

      if (Number(USER_NUM) === Number(RANDOM_NUM)) {
        profit = USER_BET * 2
      }

      return {
        profit
      }
    }
  }
}