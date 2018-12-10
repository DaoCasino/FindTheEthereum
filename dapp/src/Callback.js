export default class Callback {
    constructor() {
        this.arCalls = []
    }

    call(delay, callback){
        this.arCalls.push({ delay, callback})
    }

    update(diffTime){
        for (let i = 0; i < this.arCalls.length; i++) {
            let obj = this.arCalls[i]
            obj.delay -= diffTime
            if (obj.delay < 1){
                this.arCalls.splice(i, 1);
                obj.callback()
            }
        }
    }
}