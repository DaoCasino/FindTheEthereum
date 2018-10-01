/*global DCLib*/

DCLib.defineDAppLogic("DCGame_FTE_v1", function (payChannel){
    const MIN_VALUE = 1;
    const MAX_VALUE = 3;

    let history = [];

    let clickBox = function (userBet, valPlayer, randomHash){
        if (valPlayer < MIN_VALUE || valPlayer > MAX_VALUE) {
            console.warn('Invalid usernum, min: ' + MIN_VALUE + ' , max ' + MAX_VALUE + '');
            return;
        }

        // convert 1BET to 100000000
        userBet = DCLib.Utils.bet2dec(userBet);
        // generate random number
        const randomNum = DCLib.numFromHash(randomHash, MIN_VALUE, MAX_VALUE);

        let profit = -userBet;
        // if user win
        if (valPlayer == randomNum) {
            profit = userBet;
        }
        // add result to paychannel
        payChannel.addTX(profit);

        // console log current paychannel state
        payChannel.printLog();

        // push all data to our log
        // just FOR DEBUG
        const obj = {
            // !IMPORTANT Time can be different on client and bankroller sides
            // not use time in your primary game logic
            // timestamp: new Date().getTime(),

            userBet: userBet,
            profit: profit,
            valPlayer: valPlayer,
            balance: payChannel.getBalance(),
            randomHash: randomHash,
            randomNum: randomNum
        }
        history.push(obj)

        return obj;
    }

    return {
        Game: clickBox,
        history: history
    }
})