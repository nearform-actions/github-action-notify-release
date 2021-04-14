'use strict'

const core = require('@actions/core')
const packageJson = require('../package.json');
const { exec } = require('./exec')
const { logInfo } = require('./log')

async function getLastReleaseDate() {
  try {
    const packageName = packageJson.name

    logInfo(`Current npm package ${packageName}`)

    const { output, error } = await exec({
      cmd: 'npm',
      args: ['info', packageName, 'time', '--json'],
      parseType: 'json'
    })


    if (error) {
      return {
        npmError: error,
        npmPckNotFound: error.includes('npm ERR! 404'),
      }
    }

    const lastReleaseDate = new Date(output.modified)

    logInfo(`Last release date ${lastReleaseDate}`)

    return { lastReleaseDate }
  } catch (error) {
    core.setFailed(error.message)
  }
}

exports.getLastReleaseDate = getLastReleaseDate
