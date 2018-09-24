var Migrations = artifacts.require('./Migrations.sol')

module.exports = function (deployer, network) {
  if (network === 'development' || network === 'develop' || network === 'coverage') {
    deployer.deploy(Migrations)
  }
}
