'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV  = 'development'

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

// Ensure environment variables are read.
require('./config/env')

const fs                 = require('fs')
const path               = require('path')
const clearConsole       = require('react-dev-utils/clearConsole')
const paths                 = require('./config/paths')


// Watch contracts changes and redeploy 
const spawn = require('child_process').spawn
const root = (process.env.PWD || '../')+'/'
const truffle_config = require(root+'truffle.js')


function rimraf(dir_path) {
    if (fs.existsSync(dir_path)) {
        fs.readdirSync(dir_path).forEach(function(entry) {
            var entry_path = path.join(dir_path, entry);
            if (fs.lstatSync(entry_path).isDirectory()) {
                rimraf(entry_path);
            } else {
                fs.unlinkSync(entry_path);
            }
        });
        fs.rmdirSync(dir_path);
    }
}

let fsTimeout
const runMigrate = function() {
    clearTimeout(fsTimeout)
    fsTimeout = setTimeout(function() {
      rimraf(truffle_config.contracts_build_directory)
      clearConsole()

      console.log('')
      console.log(' Contracts changed - redeploy ')
      console.log('')

      const Migrate = spawn('truffle', ['migrate', '--reset'], 
        { cwd: `${root}`,
          stdio: 'inherit',
          shell: true
        }
      )

      Migrate.on('error', err => {
          console.error(`Migrate error: `)
        console.error(err)
      })

      Migrate.on('exit', function (code, signal) {
        if (code!=0) {
          console.error(`Migrate error:`, code , signal)
        }
      })

      Migrate.on('close', () => {
      })

    }, 3000)
}

fs.watch(truffle_config.contracts_directory  , {recursive:true}, runMigrate)
fs.watch(truffle_config.migrations_directory , {recursive:true}, runMigrate)





