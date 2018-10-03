var Migrations = artifacts.require('./Migrations.sol')

process.env.NODE_ENV  = 'development'
process.env.BABEL_ENV = 'development'

module.exports = (deployer, network) => {
  if (
    network === 'development' ||
    network === 'develop' ||
    network === 'coverage'
  ) {
    deployer.deploy(Migrations)
  }
}
