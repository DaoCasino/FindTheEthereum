const cryptico = require('js-cryptico')

const parseBigInt = (a, b) => {
  a = (a.substr(0,2) === '0x') && a.substr(2)
  return new cryptico.RSAKey().parseInt(a, b)
}

module.exports = class DCRSa {
  constructor (publicExponent = '10001') {
    this.RSA = new cryptico.RSAKey()
    this.publicExponent = publicExponent
  }

  // Method for creation private RSA keys for sign (for Bankroller)
  generate (long = 2048) {
    this.RSA.generate(long, this.publicExponent)
  }

  // Method for creation public RSA keys for verify (for Player)
  create (modulus) {
    this.RSA.setPublic(modulus, this.publicExponent)
  }

  // Verification rawMsg and Signed msg
  verify (message, signedMessage) {
    signedMessage = (signedMessage.substr(0,2) === '0x') &&
      signedMessage.substr(2)

    let msg        = parseBigInt(message, 16)
    let sigMsg     = parseBigInt(signedMessage, 16)
    msg            = msg.mod(this.RSA.n)
    let newMessage = this.RSA.doPublic(sigMsg)
    return (newMessage.equals(msg))
  }

  // Sign rawMsg
  signHash (message) {
    let msg = parseBigInt(message, 16)
    msg = msg.mod(this.RSA.n)
    let _sign = this.RSA.doPrivate(msg).toString(16)

    _sign = ((_sign.length % 2) !== 0) && '0' + _sign
    return '0x' + _sign
  }
}



